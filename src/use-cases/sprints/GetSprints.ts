import { getSprintsByProject } from "../../infrastructure/repositories/SprintRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"

export const getSprintsUseCase = async (projectId: string, userId: string) => {
    // Validar que el proyecto existe
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    // Validar que el usuario es miembro del proyecto
    const isMember = await isMemberProject(userId, projectId)
    if (!isMember && project.createdBy !== userId) {
        throw new Error("No tienes acceso a los sprints de este proyecto")
    }

    return await getSprintsByProject(projectId)
}