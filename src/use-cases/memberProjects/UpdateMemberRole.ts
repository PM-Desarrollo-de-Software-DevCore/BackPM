import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { updateMember, isMemberProject, countMembersByRole } from "../../infrastructure/repositories/MemberProjectRepository"
import { GlobalRole } from "../../entities/User"
import { ProjectRole, MemberProject } from "../../entities/MemberProject"

// Roles de los que solo puede haber uno por proyecto.
const UNIQUE_ROLES: ProjectRole[] = [ProjectRole.PROJECT_MANAGER, ProjectRole.TEAM_LEAD]

export interface MemberUpdates {
    role?: ProjectRole
    fte?: number | null
    monthly_rate?: number | null
    sale_rate?: number | null
}

export const updateMemberUseCase = async (
    projectId: string,
    userIdToUpdate: string,
    updates: MemberUpdates,
    adminGlobalRole: GlobalRole
): Promise<MemberProject | null> => {
    // Validar que solo admin global puede hacer esto
    if (adminGlobalRole !== "admin") {
        throw new Error("Solo administradores pueden actualizar miembros")
    }

    // Validar que el proyecto existe
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    // Validar que el usuario es miembro del proyecto
    const member = await isMemberProject(userIdToUpdate, projectId)
    if (!member) {
        throw new Error("El usuario no es miembro de este proyecto")
    }

    // Si se cambia el rol hacia un rol unico (project_manager, team_lead), validar que no haya otro.
    if (updates.role && UNIQUE_ROLES.includes(updates.role) && member.role !== updates.role) {
        const count = await countMembersByRole(projectId, updates.role)
        if (count > 0) {
            throw new Error(`Este proyecto ya tiene un ${updates.role} asignado`)
        }
    }

    // Solo actualizamos los campos provistos (undefined = no tocar).
    const data: MemberUpdates = {}
    if (updates.role !== undefined) data.role = updates.role
    if (updates.fte !== undefined) data.fte = updates.fte
    if (updates.monthly_rate !== undefined) data.monthly_rate = updates.monthly_rate
    if (updates.sale_rate !== undefined) data.sale_rate = updates.sale_rate

    return await updateMember(userIdToUpdate, projectId, data)
}
