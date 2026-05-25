import { createComment } from "../../infrastructure/repositories/CommentRepository"
import { getTaskById } from "../../infrastructure/repositories/TaskRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { Comment } from "../../entities/Comment"
import { notifyTaskCommented } from "../../infrastructure/services/notificationService"

export const createCommentUseCase = async (
    taskId: string,
    userId: string,
    comment: string
): Promise<Comment> => {
    if (!comment || comment.trim().length === 0) {
        throw new Error("El comentario no puede estar vacío")
    }

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

    const created = await createComment({
        comment: comment.trim(),
        id_user: userId,
        id_task: taskId
    })

    await notifyTaskCommented(taskId, userId)

    return created
}
