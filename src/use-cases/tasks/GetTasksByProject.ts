import { getTasksByProject } from "../../infrastructure/repositories/TaskRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"

export const getTasksByProjectUseCase = async (projectId: string, userId: string) => {
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    const isMember = await isMemberProject(userId, projectId)
    if (!isMember && project.createdBy !== userId) {
        throw new Error("No tienes acceso a las tareas de este proyecto")
    }

    return await getTasksByProject(projectId)
}
