import { z } from "zod"
import { Request, Response, NextFunction } from "express"

const registerSchema = z.object({
    email: z.string().email("Email invalido"),
    password: z.string().min(8, "La contraseña debe tener minimo 8 caracteres"),
    name: z.string().min(1,"El nombre es obligatorio"),
    lastname: z.string().min(1, "El apellido es obligatorio"),
    role: z.enum(["admin","developer","scrum_master"], { message: "El rol es invalido" })
})

export const validateRegister = ( req: Request, res: Response, next: NextFunction) => {
    const result = registerSchema.safeParse(req.body)
    if (!result.success) {
        const message = result.error.issues[0]?.message || "Error de validación"
        return res.status(400).json({ succes: false, message })
    }
    next()
}

