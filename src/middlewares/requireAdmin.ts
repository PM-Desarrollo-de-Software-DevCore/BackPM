import { NextFunction, Response } from "express"
import { AuthenticatedRequest } from "./requireAuth"
import { findUserById } from "../infrastructure/repositories/UserRepository"
import { GlobalRole } from "../entities/User"

// Restringe el acceso a administradores. Se encadena DESPUES de requireAuth
// (que ya pobló req.userId). El rol se resuelve contra la BD a proposito: el JWT
// solo trae { id } (sin rol), asi que no se puede confiar en el token para esto.
export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authUserId = req.userId

    if (!authUserId) {
        return res.status(401).json({ success: false, message: "No autorizado" })
    }

    const authUser = await findUserById(authUserId)
    if (authUser?.globalRole === GlobalRole.ADMIN) {
        return next()
    }

    return res.status(403).json({ success: false, message: "Requiere privilegios de administrador" })
}
