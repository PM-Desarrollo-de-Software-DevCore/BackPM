import { getCommentById } from "../../infrastructure/repositories/CommentRepository"
import { getTaskById } from "../../infrastructure/repositories/TaskRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"

export const getCommentByIdUseCase = async (commentId: string, userId: string) => {
    const comment = await getCommentById(commentId)
    if (!comment) {
        throw new Error("Comentario no encontrado")
    }

    const task = await getTaskById(comment.id_task)
    if (!task) {
        throw new Error("Tarea del comentario no encontrada")
    }

    const project = await getProjectById(task.id_project)
    if (!project) {
        throw new Error("Proyecto de la tarea no encontrado")
    }

    const isMember = await isMemberProject(userId, task.id_project)
    if (!isMember && project.createdBy !== userId) {
        throw new Error("No tienes acceso a este comentario")
    }

    return comment
}
