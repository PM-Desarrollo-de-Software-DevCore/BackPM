import { NextFunction, Response } from "express"
import { AuthenticatedRequest } from "./requireAuth"
import { findUserById } from "../infrastructure/repositories/UserRepository"
import { GlobalRole } from "../entities/User"

export const requireSelfOrAdmin = (paramName: string = "id") => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const authUserId = req.userId
        const targetId = String(req.params[paramName])

        if (!authUserId) {
            return res.status(401).json({ success: false, message: "No autorizado" })
        }

        if (authUserId === targetId) {
            return next()
        }

        const authUser = await findUserById(authUserId)
        if (authUser?.globalRole === GlobalRole.ADMIN) {
            return next()
        }

        return res.status(403).json({ success: false, message: "No tienes permiso para modificar este recurso" })
    }
}
