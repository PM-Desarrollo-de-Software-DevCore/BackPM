import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { updateMemberRole, isMemberProject, countProjectManagers } from "../../infrastructure/repositories/MemberProjectRepository"
import { GlobalRole } from "../../entities/User"
import { ProjectRole } from "../../entities/MemberProject"

export const updateMemberRoleUseCase = async (
    projectId: string,
    userIdToUpdate: string,
    newRole: ProjectRole,
    adminUserId: string,
    adminGlobalRole: GlobalRole
): Promise<any> => {
    // Validar que solo admin global puede hacer esto
    if (adminGlobalRole !== "admin") {
        throw new Error("Solo administradores pueden cambiar roles de miembros")
    }

    // Validar que el proyecto existe
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    // Validar que el usuario es miembro del proyecto
    const isMember = await isMemberProject(userIdToUpdate, projectId)
    if (!isMember) {
        throw new Error("El usuario no es miembro de este proyecto")
    }

    // Si se intenta cambiar a project_manager, validar que no haya otro
    if (newRole === ProjectRole.PROJECT_MANAGER) {
        const pmCount = await countProjectManagers(projectId)
        if (pmCount > 0) {
            throw new Error("Este proyecto ya tiene un project_manager asignado")
        }
    }

    return await updateMemberRole(userIdToUpdate, projectId, newRole)
}