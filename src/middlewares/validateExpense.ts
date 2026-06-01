import { Request, Response, NextFunction } from "express"
import { z } from "zod"

const categorySchema = z.enum(["software", "infrastructure", "services", "travel", "other"], {
    message: "Categoria invalida"
})

const createExpenseSchema = z.object({
    amount: z.number().positive("El monto debe ser mayor a 0"),
    category: categorySchema,
    description: z.string().optional().nullable(),
    date: z.coerce.date({ message: "date invalida" })
})

const updateExpenseSchema = z.object({
    amount: z.number().positive("El monto debe ser mayor a 0").optional(),
    category: categorySchema.optional(),
    description: z.string().optional().nullable(),
    date: z.coerce.date({ message: "date invalida" }).optional()
}).refine(
    (data) => data.amount !== undefined || data.category !== undefined || data.description !== undefined || data.date !== undefined,
    { message: "Debes enviar al menos un campo para actualizar (amount, category, description o date)" }
)

export const validateCreateExpense = (req: Request, res: Response, next: NextFunction) => {
    const result = createExpenseSchema.safeParse(req.body)
    if (!result.success) {
        const message = result.error.issues[0]?.message || "Error de validacion"
        return res.status(400).json({ success: false, message })
    }
    req.body = result.data
    next()
}

export const validateUpdateExpense = (req: Request, res: Response, next: NextFunction) => {
    const result = updateExpenseSchema.safeParse(req.body)
    if (!result.success) {
        const message = result.error.issues[0]?.message || "Error de validacion"
        return res.status(400).json({ success: false, message })
    }
    req.body = result.data
    next()
}
