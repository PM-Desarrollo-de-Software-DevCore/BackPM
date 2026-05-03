import { getCommentById, updateComment } from "../../infrastructure/repositories/CommentRepository"

export const updateCommentUseCase = async (
    commentId: string,
    userId: string,
    newComment: string
) => {
    if (!newComment || newComment.trim().length === 0) {
        throw new Error("El comentario no puede estar vacío")
    }

    const existing = await getCommentById(commentId)
    if (!existing) {
        throw new Error("Comentario no encontrado")
    }

    if (existing.id_user !== userId) {
        throw new Error("Solo el autor puede editar este comentario")
    }

    const updated = await updateComment(commentId, { comment: newComment.trim() })
    if (!updated) {
        throw new Error("No se pudo actualizar el comentario")
    }

    return updated
}
