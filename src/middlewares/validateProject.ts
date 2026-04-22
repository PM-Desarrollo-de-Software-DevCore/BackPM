import { z } from "zod"
import { Request, Response, NextFunction } from "express"

const createProjectSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    description: z.string().optional().nullable(),
    start_date: z.coerce.date({ message: "start_date invalida" }),
    end_date: z.coerce.date({ message: "end_date invalida" }).optional().nullable(),
    status: z.enum(["active", "finished", "paused"]).optional()
}).refine(
    (data) => !data.end_date || data.start_date <= data.end_date,
    { message: "La fecha de inicio debe ser anterior a la fecha de fin", path: ["end_date"] }
)

const updateProjectSchema = z.object({
    name: z.string().min(1, "El nombre no puede estar vacio").optional(),
    description: z.string().optional().nullable(),
    start_date: z.coerce.date({ message: "start_date invalida" }).optional(),
    end_date: z.coerce.date({ message: "end_date invalida" }).optional().nullable(),
    status: z.enum(["active", "finished", "paused"]).optional()
}).refine(
    (data) => !(data.start_date && data.end_date) || data.start_date <= data.end_date,
    { message: "La fecha de inicio debe ser anterior a la fecha de fin", path: ["end_date"] }
)

export const validateCreateProject = (req: Request, res: Response, next: NextFunction) => {
    const result = createProjectSchema.safeParse(req.body)
    if (!result.success) {
        const message = result.error.issues[0]?.message || "Error de validacion"
        return res.status(400).json({ success: false, message })
    }
    req.body = result.data
    next()
}

export const validateUpdateProject = (req: Request, res: Response, next: NextFunction) => {
    const result = updateProjectSchema.safeParse(req.body)
    if (!result.success) {
        const message = result.error.issues[0]?.message || "Error de validacion"
        return res.status(400).json({ success: false, message })
    }
    req.body = result.data
    next()
}