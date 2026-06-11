import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { addMemberToProject, isMemberProject, countMembersByRole } from "../../infrastructure/repositories/MemberProjectRepository"
import { findUserById } from "../../infrastructure/repositories/UserRepository"
import { GlobalRole } from "../../entities/User"
import { ProjectRole } from "../../entities/MemberProject"
import { notifyProjectMemberAdded } from "../../infrastructure/services/notificationService"

// Roles de los que solo puede haber uno por proyecto.
const UNIQUE_ROLES: ProjectRole[] = [ProjectRole.PROJECT_MANAGER, ProjectRole.TEAM_LEAD]

export const addMemberToProjectUseCase = async (
    projectId: string,
    userIdToAdd: string,
    roleToAssign: ProjectRole,
    fte: number | null,
    monthlyRate: number | null,
    saleRate: number | null,
    adminUserId: string,
    adminGlobalRole: GlobalRole
): Promise<any> => {
    // Validar que solo admin global puede hacer esto
    if (adminGlobalRole !== "admin") {
        throw new Error("Solo administradores pueden agregar miembros a proyectos")
    }

    // Validar que el proyecto existe
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    // Validar que el usuario a agregar existe
    const userToAdd = await findUserById(userIdToAdd)
    if (!userToAdd) {
        throw new Error("Usuario a agregar no encontrado")
    }

    // Validar que el usuario no esté ya en el proyecto
    const alreadyMember = await isMemberProject(userIdToAdd, projectId)
    if (alreadyMember) {
        throw new Error("El usuario ya es miembro de este proyecto")
    }

    // Roles unicos (project_manager, team_lead): maximo uno por proyecto.
    if (UNIQUE_ROLES.includes(roleToAssign)) {
        const count = await countMembersByRole(projectId, roleToAssign)
        if (count > 0) {
            throw new Error(`Este proyecto ya tiene un ${roleToAssign} asignado`)
        }
    }

    const member = await addMemberToProject(userIdToAdd, projectId, roleToAssign, fte, monthlyRate, saleRate)
    await notifyProjectMemberAdded(projectId, userIdToAdd, adminUserId)
    return member
}