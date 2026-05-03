import { getCommentById, deleteComment } from "../../infrastructure/repositories/CommentRepository"
import { getTaskById } from "../../infrastructure/repositories/TaskRepository"
import { getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { ProjectRole } from "../../entities/MemberProject"

export const deleteCommentUseCase = async (commentId: string, userId: string) => {
    const comment = await getCommentById(commentId)
    if (!comment) {
        throw new Error("Comentario no encontrado")
    }

    const isAuthor = comment.id_user === userId

    let isProjectManager = false
    if (!isAuthor) {
        const task = await getTaskById(comment.id_task)
        if (!task) {
            throw new Error("Tarea del comentario no encontrada")
        }
        const role = await getUserRoleInProject(userId, task.id_project)
        isProjectManager = role === ProjectRole.PROJECT_MANAGER
    }

    if (!isAuthor && !isProjectManager) {
        throw new Error("Solo el autor o el project_manager pueden eliminar este comentario")
    }

    const deleted = await deleteComment(commentId)
    if (!deleted) {
        throw new Error("No se pudo eliminar el comentario")
    }

    return { message: "Comentario eliminado correctamente" }
}
