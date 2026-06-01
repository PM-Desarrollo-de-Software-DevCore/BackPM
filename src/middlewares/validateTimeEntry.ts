import { Request, Response, NextFunction } from "express"
import { z } from "zod"

const createTimeEntrySchema = z.object({
    hours: z.number().positive("Las horas deben ser mayores a 0").max(24, "Una entrada no puede superar 24 horas"),
    work_date: z.coerce.date({ message: "work_date invalida" }),
    description: z.string().optional().nullable()
})

const updateTimeEntrySchema = z.object({
    hours: z.number().positive("Las horas deben ser mayores a 0").max(24, "Una entrada no puede superar 24 horas").optional(),
    work_date: z.coerce.date({ message: "work_date invalida" }).optional(),
    description: z.string().optional().nullable()
}).refine(
    (data) => data.hours !== undefined || data.work_date !== undefined || data.description !== undefined,
    { message: "Debes enviar al menos un campo para actualizar (hours, work_date o description)" }
)

export const validateCreateTimeEntry = (req: Request, res: Response, next: NextFunction) => {
    const result = createTimeEntrySchema.safeParse(req.body)
    if (!result.success) {
        const message = result.error.issues[0]?.message || "Error de validacion"
        return res.status(400).json({ success: false, message })
    }
    req.body = result.data
    next()
}

export const validateUpdateTimeEntry = (req: Request, res: Response, next: NextFunction) => {
    const result = updateTimeEntrySchema.safeParse(req.body)
    if (!result.success) {
        const message = result.error.issues[0]?.message || "Error de validacion"
        return res.status(400).json({ success: false, message })
    }
    req.body = result.data
    next()
}
