import { Response } from "express"
import { AuthenticatedRequest } from "../middlewares/requireAuth"
import { getMyNotificationsUseCase } from "../use-cases/notifications/GetMyNotifications"
import { markMyNotificationsAsReadUseCase } from "../use-cases/notifications/MarkNotificationsAsRead"

export const getMyNotificationsController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 20
        const result = await getMyNotificationsUseCase(req.userId, Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 20)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const markMyNotificationsAsReadController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const updated = await markMyNotificationsAsReadUseCase(req.userId)
        return res.status(200).json({ success: true, data: { updated } })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}