import { Request, Response, NextFunction } from "express"
import { z } from "zod"

const uuidSchema = z.string().uuid("Id invalido")

const addMemberBodySchema = z.object({
    userId: z.string().uuid("userId invalido"),
    role: z.enum(["project_manager", "scrum_master", "developer"], {
        message: "Rol invalido"
    })
})

const updateMemberRoleBodySchema = z.object({
    role: z.enum(["project_manager", "scrum_master", "developer"], {
        message: "Rol invalido"
    })
})

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

export const validateUpdateMemberRoleBody = (req: Request, res: Response, next: NextFunction) => {
    const result = updateMemberRoleBodySchema.safeParse(req.body)

    if (!result.success) {
        const message = result.error.issues[0]?.message || "Error de validacion"
        return res.status(400).json({ success: false, message })
    }

    req.body = result.data
    next()
}