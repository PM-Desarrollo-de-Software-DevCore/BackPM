import { AppDataSource } from "../../infrastructure/db/DataSource"
import { MemberProjectEntity } from "../../infrastructure/db/entities/MemberProjectEntity"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { findUserById } from "../../infrastructure/repositories/UserRepository"
import { GlobalRole } from "../../entities/User"
import { ProjectRole } from "../../entities/MemberProject"
import { notifyProjectMemberAdded } from "../../infrastructure/services/notificationService"

// Roles de los que solo puede haber uno por proyecto.
const UNIQUE_ROLES: ProjectRole[] = [ProjectRole.PROJECT_MANAGER, ProjectRole.TEAM_LEAD]
const VALID_ROLES = Object.values(ProjectRole) as ProjectRole[]

export interface MemberAddOp {
    userId: string
    role: ProjectRole
    fte?: number | null
    monthly_rate?: number | null
}

export interface MemberUpdateOp {
    userId: string
    role: ProjectRole
    fte?: number | null
    monthly_rate?: number | null
}

export interface SyncMembersInput {
    add?: MemberAddOp[]
    update?: MemberUpdateOp[]
    remove?: string[]
}

export interface SyncMembersResult {
    message: string
    added: number
    updated: number
    removed: number
}

/**
 * Sincroniza los miembros de un proyecto (altas/cambios de rol/bajas) en UNA sola
 * transacción atómica. Reemplaza el fan-out de escrituras (add/update/remove uno por uno)
 * que hacía CreateProjectModal: o se aplican TODAS o ninguna.
 *
 * Mantiene las mismas reglas que los endpoints por-miembro: solo admin global; proyecto
 * y usuarios deben existir; no agregar a quien ya es miembro; no actualizar/eliminar a
 * quien no lo es; no eliminar al creador; roles únicos (project_manager, team_lead) máximo
 * uno por proyecto — chequeado sobre el ROSTER FINAL, por lo que un swap (quitar el PM
 * actual y agregar otro en el mismo lote) es válido.
 */
export const syncProjectMembersUseCase = async (
    projectId: string,
    requesterId: string,
    requesterGlobalRole: GlobalRole,
    input: SyncMembersInput
): Promise<SyncMembersResult> => {
    if (requesterGlobalRole !== "admin") {
        throw new Error("Solo administradores pueden gestionar miembros de proyectos")
    }

    const add = input.add ?? []
    const update = input.update ?? []
    const remove = input.remove ?? []

    // Validación de forma
    for (const op of [...add, ...update]) {
        if (!op || typeof op.userId !== "string" || op.userId.length === 0) {
            throw new Error("userId inválido en la sincronización de miembros")
        }
        if (!VALID_ROLES.includes(op.role)) {
            throw new Error(`Rol inválido: ${op.role}`)
        }
    }
    for (const userId of remove) {
        if (typeof userId !== "string" || userId.length === 0) {
            throw new Error("userId inválido en remove")
        }
    }

    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    // Los usuarios a agregar deben existir
    for (const op of add) {
        const user = await findUserById(op.userId)
        if (!user) {
            throw new Error(`Usuario a agregar no encontrado: ${op.userId}`)
        }
    }

    const addedUserIds: string[] = []

    await AppDataSource.transaction(async (manager) => {
        const repo = manager.getRepository(MemberProjectEntity)

        const current = await repo.find({ where: { id_project: projectId } })
        const currentByUser = new Map(current.map((member) => [member.id_user, member]))

        // Validaciones contra el estado actual (dentro de la transacción)
        for (const userId of remove) {
            if (!currentByUser.has(userId)) {
                throw new Error("Un usuario a eliminar no es miembro de este proyecto")
            }
            if (project.createdBy === userId) {
                throw new Error("No se puede eliminar al creador del proyecto")
            }
        }
        for (const op of update) {
            if (!currentByUser.has(op.userId)) {
                throw new Error("Un usuario a actualizar no es miembro de este proyecto")
            }
        }
        for (const op of add) {
            if (currentByUser.has(op.userId)) {
                throw new Error("Un usuario a agregar ya es miembro de este proyecto")
            }
        }

        // Roles únicos sobre el roster FINAL (permite swaps válidos)
        const finalRoles = new Map<string, ProjectRole>()
        for (const member of current) finalRoles.set(member.id_user, member.role)
        for (const userId of remove) finalRoles.delete(userId)
        for (const op of update) finalRoles.set(op.userId, op.role)
        for (const op of add) finalRoles.set(op.userId, op.role)
        for (const uniqueRole of UNIQUE_ROLES) {
            const count = [...finalRoles.values()].filter((role) => role === uniqueRole).length
            if (count > 1) {
                throw new Error(`Este proyecto no puede tener más de un ${uniqueRole}`)
            }
        }

        // Aplicar en orden seguro: remove -> update -> add
        for (const userId of remove) {
            await repo.delete({ id_user: userId, id_project: projectId })
        }
        for (const op of update) {
            const data: Partial<MemberProjectEntity> = { role: op.role }
            if (op.fte !== undefined) data.fte = op.fte
            if (op.monthly_rate !== undefined) data.monthly_rate = op.monthly_rate
            await repo.update({ id_user: op.userId, id_project: projectId }, data)
        }
        for (const op of add) {
            const member = repo.create({
                id_user: op.userId,
                id_project: projectId,
                role: op.role,
                fte: op.fte ?? null,
                monthly_rate: op.monthly_rate ?? null,
            })
            await repo.save(member)
            addedUserIds.push(op.userId)
        }
    })

    // Notificaciones SOLO tras el commit (no notificar si la transacción hizo rollback).
    for (const userId of addedUserIds) {
        await notifyProjectMemberAdded(projectId, userId, requesterId)
    }

    return {
        message: "Miembros sincronizados",
        added: add.length,
        updated: update.length,
        removed: remove.length,
    }
}
