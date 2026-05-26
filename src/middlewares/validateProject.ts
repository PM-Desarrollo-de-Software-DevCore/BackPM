import { z } from "zod"
import { Request, Response, NextFunction } from "express"

const parseOptionalNumber = (schema: z.ZodTypeAny) =>
    z.preprocess((value) => {
        if (value === "" || value === undefined) {
            return undefined
        }

        if (value === null) {
            return null
        }

        if (typeof value === "string") {
            const parsed = Number(value)
            return Number.isNaN(parsed) ? value : parsed
        }

        return value
    }, schema)

const methodologySchema = z.enum(["scrum", "kanban"], { message: "La metodologia es invalida" })
const billingModelSchema = z.enum(["fixed_price", "time_and_materials", "retainer"], {
    message: "El modelo de facturacion es invalido"
})

const optionalEstimatedSprintsSchema = parseOptionalNumber(z.union([z.number().int().positive(), z.null()]).optional())
const optionalBudgetSchema = parseOptionalNumber(z.union([z.number().nonnegative(), z.null()]).optional())
const optionalMonthlyCostSchema = parseOptionalNumber(z.union([z.number().nonnegative(), z.null()]).optional())

const createProjectSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    description: z.string().optional().nullable(),
    client: z.string().min(1, "El cliente es obligatorio"),
    project_type: z.string().min(1, "El tipo de proyecto es obligatorio"),
    methodology: methodologySchema,
    estimated_sprints: optionalEstimatedSprintsSchema,
    budget: optionalBudgetSchema,
    monthly_cost: optionalMonthlyCostSchema,
    billing_model: billingModelSchema.optional().nullable(),
    start_date: z.coerce.date({ message: "start_date invalida" }),
    end_date: z.coerce.date({ message: "end_date invalida" }),
    priority: z.enum(["high", "medium", "low"], { message: "La prioridad es invalida" }).optional(),
    status: z.enum(["planning", "in_progress", "completed"], { message: "El status es invalido" })
}).refine(
    (data) => data.start_date <= data.end_date,
    { message: "La fecha de inicio debe ser anterior a la fecha de fin", path: ["end_date"] }
)

const updateProjectSchema = z.object({
    name: z.string().min(1, "El nombre no puede estar vacio").optional(),
    description: z.string().optional().nullable(),
    client: z.string().min(1, "El cliente no puede estar vacio").optional(),
    project_type: z.string().min(1, "El tipo de proyecto no puede estar vacio").optional(),
    methodology: methodologySchema.optional(),
    estimated_sprints: optionalEstimatedSprintsSchema,
    budget: optionalBudgetSchema,
    monthly_cost: optionalMonthlyCostSchema,
    billing_model: billingModelSchema.optional().nullable(),
    start_date: z.coerce.date({ message: "start_date invalida" }).optional(),
    end_date: z.coerce.date({ message: "end_date invalida" }).optional().nullable(),
    priority: z.enum(["high", "medium", "low"], { message: "La prioridad es invalida" }).optional(),
    status: z.enum(["planning", "in_progress", "completed"], { message: "El status es invalido" }).optional()
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