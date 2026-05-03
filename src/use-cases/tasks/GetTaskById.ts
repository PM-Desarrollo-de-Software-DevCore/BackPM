import { getTaskById } from "../../infrastructure/repositories/TaskRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"

export const getTaskByIdUseCase = async (taskId: string, userId: string) => {
    const task = await getTaskById(taskId)
    if (!task) {
        throw new Error("Tarea no encontrada")
    }

    const project = await getProjectById(task.id_project)
    if (!project) {
        throw new Error("Proyecto de la tarea no encontrado")
    }

    const isMember = await isMemberProject(userId, task.id_project)
    if (!isMember && project.createdBy !== userId) {
        throw new Error("No tienes acceso a esta tarea")
    }

    return task
}
