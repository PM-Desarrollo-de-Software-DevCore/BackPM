import { Response, Request } from "express"
import { AuthenticatedRequest } from "../middlewares/requireAuth"
import { createCommentUseCase } from "../use-cases/comments/CreateComment"
import { getCommentsByTaskUseCase } from "../use-cases/comments/GetCommentsByTask"
import { getCommentByIdUseCase } from "../use-cases/comments/GetCommentById"
import { updateCommentUseCase } from "../use-cases/comments/UpdateComment"
import { deleteCommentUseCase } from "../use-cases/comments/DeleteComment"

type TaskParams = { taskId: string }
type CommentParams = { commentId: string }

type TaskRequest = AuthenticatedRequest & Request<TaskParams>
type CommentRequest = AuthenticatedRequest & Request<CommentParams>

export const createCommentController = async (req: TaskRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { taskId } = req.params
        const { comment } = req.body

        if (typeof comment !== "string") {
            return res.status(400).json({ success: false, message: "El comentario es obligatorio" })
        }

        const result = await createCommentUseCase(taskId, req.userId, comment)
        return res.status(201).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getCommentsByTaskController = async (req: TaskRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { taskId } = req.params
        const result = await getCommentsByTaskUseCase(taskId, req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getCommentByIdController = async (req: CommentRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { commentId } = req.params
        const result = await getCommentByIdUseCase(commentId, req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message })
    }
}

export const updateCommentController = async (req: CommentRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { commentId } = req.params
        const { comment } = req.body

        if (typeof comment !== "string") {
            return res.status(400).json({ success: false, message: "El comentario es obligatorio" })
        }

        const result = await updateCommentUseCase(commentId, req.userId, comment)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const deleteCommentController = async (req: CommentRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { commentId } = req.params
        const result = await deleteCommentUseCase(commentId, req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}
