import { Request, Response, NextFunction } from "express"
import { z } from "zod"

const uuidSchema = z.string().uuid("Id invalido")

const roleSchema = z.enum(["project_manager", "scrum_master", "developer", "team_lead"], {
    message: "Rol invalido"
})

const fteSchema = z.number().positive("El FTE debe ser mayor a 0").max(1, "El FTE no puede ser mayor a 1").nullable().optional()
// Mismo criterio para costo (monthly_rate) y tarifa de venta (sale_rate): >= 0, opcional, nullable.
const rateSchema = z.number().nonnegative("El rate no puede ser negativo").nullable().optional()

const addMemberBodySchema = z.object({
    userId: z.string().uuid("userId invalido"),
    role: roleSchema,
    fte: fteSchema,
    monthly_rate: rateSchema,
    sale_rate: rateSchema
})

const updateMemberBodySchema = z.object({
    role: roleSchema.optional(),
    fte: fteSchema,
    monthly_rate: rateSchema,
    sale_rate: rateSchema
}).refine(
    (data) => data.role !== undefined || data.fte !== undefined || data.monthly_rate !== undefined || data.sale_rate !== undefined,
    { message: "Debes enviar al menos un campo para actualizar (role, fte, monthly_rate o sale_rate)" }
)

export const validateProjectIdParam = (req: Request, res: Response, next: NextFunction) => {
    const result = uuidSchema.safeParse(req.params.projectId)

    if (!result.success) {
        const message = result.error.issues[0]?.message || "projectId invalido"
        return res.status(400).json({ success: false, message })
    }

    next()
}

export const validateProjectAndUserParams = (req: Request, res: Response, next: NextFunction) => {
    const projectIdResult = uuidSchema.safeParse(req.params.projectId)
    if (!projectIdResult.success) {
        const message = projectIdResult.error.issues[0]?.message || "projectId invalido"
        return res.status(400).json({ success: false, message })
    }

    const userIdResult = uuidSchema.safeParse(req.params.userId)
    if (!userIdResult.success) {
        const message = userIdResult.error.issues[0]?.message || "userId invalido"
        return res.status(400).json({ success: false, message })
    }

    next()
}

export const validateAddMemberBody = (req: Request, res: Response, next: NextFunction) => {
    const result = addMemberBodySchema.safeParse(req.body)

    if (!result.success) {
        const message = result.error.issues[0]?.message || "Error de validacion"
        return res.status(400).json({ success: false, message })
    }

    req.body = result.data
    next()
}

export const validateUpdateMemberBody = (req: Request, res: Response, next: NextFunction) => {
    const result = updateMemberBodySchema.safeParse(req.body)

    if (!result.success) {
        const message = result.error.issues[0]?.message || "Error de validacion"
        return res.status(400).json({ success: false, message })
    }

    req.body = result.data
    next()
}