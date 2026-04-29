import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject, removeMemberFromProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { GlobalRole } from "../../entities/User"

export const removeMemberFromProjectUseCase = async (
    projectId: string,
    userIdToRemove: string,
    adminUserId: string,
    adminGlobalRole: GlobalRole
): Promise<any> => {
    // Validar que solo admin global puede hacer esto
    if (adminGlobalRole !== "admin") {
        throw new Error("Solo administradores pueden eliminar miembros de proyectos")
    }

    // Validar que el proyecto existe
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    // Validar que el usuario es miembro del proyecto
    const isMember = await isMemberProject(userIdToRemove, projectId)
    if (!isMember) {
        throw new Error("El usuario no es miembro de este proyecto")
    }

    // No se puede eliminar el creador del proyecto
    if (project.createdBy === userIdToRemove) {
        throw new Error("No se puede eliminar al creador del proyecto")
    }

    const deleted = await removeMemberFromProject(userIdToRemove, projectId)
    if (!deleted) {
        throw new Error("No se pudo eliminar el miembro")
    }

    return { message: "Miembro eliminado correctamente" }
}