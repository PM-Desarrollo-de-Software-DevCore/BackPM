import { z } from "zod"
import { Request, Response, NextFunction } from "express"

const loginSchema = z.object({
    email: z.string().email("Email invalido"),
    password: z.string().min(1, "La contraseña es obligatoria")
})

export const validateLogin = ( req: Request, res: Response, next: NextFunction) => {
    const result = loginSchema.safeParse(req.body)
    if (!result.success) {
        const message = result.error.issues[0]?.message || "Validation error"
        return res.status(400).json({ succes: false, message })
    }
    next()
}

