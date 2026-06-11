import { Request, Response, NextFunction } from "express"
import { z } from "zod"

const statusSchema = z.enum(["draft", "sent", "paid"], { message: "Estado invalido" })

const createInvoiceSchema = z.object({
    // Opcional: si se omite, el backend lo auto-calcula para proyectos T&M con periodo.
    amount: z.number().positive("El monto debe ser mayor a 0").optional(),
    status: statusSchema.optional(),
    concept: z.string().optional().nullable(),
    issue_date: z.coerce.date({ message: "issue_date invalida" }),
    due_date: z.coerce.date({ message: "due_date invalida" }).optional().nullable(),
    period_start: z.coerce.date({ message: "period_start invalida" }).optional().nullable(),
    period_end: z.coerce.date({ message: "period_end invalida" }).optional().nullable(),
    id_milestone: z.string().uuid("id_milestone invalido").optional().nullable()
})

const updateInvoiceSchema = z.object({
    amount: z.number().positive("El monto debe ser mayor a 0").optional(),
    status: statusSchema.optional(),
    concept: z.string().optional().nullable(),
    issue_date: z.coerce.date({ message: "issue_date invalida" }).optional(),
    due_date: z.coerce.date({ message: "due_date invalida" }).optional().nullable(),
    period_start: z.coerce.date({ message: "period_start invalida" }).optional().nullable(),
    period_end: z.coerce.date({ message: "period_end invalida" }).optional().nullable(),
    id_milestone: z.string().uuid("id_milestone invalido").optional().nullable()
}).refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    { message: "Debes enviar al menos un campo para actualizar" }
)

export const validateCreateInvoice = (req: Request, res: Response, next: NextFunction) => {
    const result = createInvoiceSchema.safeParse(req.body)
    if (!result.success) {
        const message = result.error.issues[0]?.message || "Error de validacion"
        return res.status(400).json({ success: false, message })
    }
    req.body = result.data
    next()
}

export const validateUpdateInvoice = (req: Request, res: Response, next: NextFunction) => {
    const result = updateInvoiceSchema.safeParse(req.body)
    if (!result.success) {
        const message = result.error.issues[0]?.message || "Error de validacion"
        return res.status(400).json({ success: false, message })
    }
    req.body = result.data
    next()
}
