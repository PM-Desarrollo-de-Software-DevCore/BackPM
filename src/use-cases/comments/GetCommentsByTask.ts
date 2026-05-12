import { getCommentsByTask } from "../../infrastructure/repositories/CommentRepository"
import { getTaskById } from "../../infrastructure/repositories/TaskRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"

export const getCommentsByTaskUseCase = async (taskId: string, userId: string) => {
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
        throw new Error("No tienes acceso a los comentarios de esta tarea")
    }

    const comments = await getCommentsByTask(taskId)

    return comments.map((c) => ({
        id_comment: c.id_comment,
        comment: c.comment,
        id_task: c.id_task,
        createdAt: c.createdAt,
        user: c.user
            ? {
                id: c.user.id,
                name: c.user.name,
                lastname: c.user.lastname,
                email: c.user.email
            }
            : null
    }))
}
