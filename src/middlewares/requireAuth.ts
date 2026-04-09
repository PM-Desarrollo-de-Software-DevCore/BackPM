import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "../config/env"

export interface AuthenticatedRequest extends Request {
    userId?: string
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Token no proporcionado" })
    }

    const token = authHeader.split(" ")[1]


    if (!token) {
        return res.status(401).json({ success: false, message: "Token no proporcionado" })
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET!)

        if (typeof decoded === "string") {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const payload = decoded as JwtPayload
        const userId = payload.id

        if (typeof userId !== "string") {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        req.userId = userId
        next()
    } catch {
        return res.status(401).json({ success: false, message: "Token invalido o expirado" })
    }
}
