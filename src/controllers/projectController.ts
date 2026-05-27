import { Response } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import { AuthenticatedRequest } from "../middlewares/requireAuth"
import { createProjectUseCase } from "../use-cases/projects/CreateProject"
import { getMyProjectsUseCase } from "../use-cases/projects/GetMyProjects"
import { getProjectByIdUseCase } from "../use-cases/projects/GetProjectById"
import { updateProjectUseCase } from "../use-cases/projects/UpdateProject"
import { deleteProjectUseCase } from "../use-cases/projects/DeleteProject"
import { ProjectPriority, ProjectStatus, ProjectMethodology, ProjectBillingModel } from "../entities/Project"
import { generateProjectReport } from "../use-cases/reports/GenerateProjectReport"
import { JWT_SECRET } from "../config/env"
import { getProjectVelocityUseCase } from "../use-cases/projects/GetProjectVelocity"
import { getProjectStoryPointsUseCase } from "../use-cases/projects/GetProjectStoryPoints"

export const createProjectController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const {
            name,
            description,
            client,
            project_type,
            methodology,
            estimated_sprints,
            budget,
            monthly_cost,
            billing_model,
            start_date,
            end_date,
            priority,
            status
        } = req.body

        const result = await createProjectUseCase(
            name,
            description,
            client,
            project_type,
            methodology as ProjectMethodology,
            estimated_sprints ?? null,
            budget ?? null,
            monthly_cost ?? null,
            billing_model ?? null,
            new Date(start_date),
            end_date ? new Date(end_date) : null,
            priority ?? ProjectPriority.MEDIUM,
            status ?? ProjectStatus.PLANNING,
            req.userId
        )

        return res.status(201).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getMyProjectsController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const result = await getMyProjectsUseCase(req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getProjectByIdController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const projectId = req.params.projectId
        if (typeof projectId !== "string") {
            return res.status(400).json({ success: false, message: "projectId invalido" })
        }

        const result = await getProjectByIdUseCase(projectId, req.userId)

        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message })
    }
}

export const updateProjectController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const projectId = req.params.projectId
        if (typeof projectId !== "string") {
            return res.status(400).json({ success: false, message: "projectId invalido" })
        }

        const body = req.body

        const result = await updateProjectUseCase(projectId, req.userId, {
            ...body,
            start_date: body.start_date ? new Date(body.start_date) : undefined,
            end_date: body.end_date ? new Date(body.end_date) : body.end_date
        })

        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const deleteProjectController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const projectId = req.params.projectId
        if (typeof projectId !== "string") {
            return res.status(400).json({ success: false, message: "projectId invalido" })
        }

        const result = await deleteProjectUseCase(projectId, req.userId)

        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

const resolveReportUserId = (req: AuthenticatedRequest) => {
    if (req.userId) {
        return req.userId
    }

    const authHeader = req.headers.authorization
    const headerToken = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : ""
    const queryToken = typeof req.query.token === "string" ? req.query.token : ""
    const token = headerToken || queryToken

    if (!token) {
        throw new Error("Token no proporcionado")
    }

    const decoded = jwt.verify(token, JWT_SECRET!)

    if (typeof decoded === "string") {
        throw new Error("Token invalido")
    }

    const payload = decoded as JwtPayload
    const userId = payload.id

    if (typeof userId !== "string") {
        throw new Error("Token invalido")
    }

    return userId
}

export const getProjectReportController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = resolveReportUserId(req)

        const projectId = req.params.projectId
        if (typeof projectId !== "string") {
            return res.status(400).json({ success: false, message: "projectId invalido" })
        }

        const report = await generateProjectReport(projectId, userId)

        const download = req.query.download === "1" || req.query.download === "true"

        res.setHeader("Content-Type", "application/pdf")
        res.setHeader("Content-Disposition", `${download ? "attachment" : "inline"}; filename="${report.filename}"`)
        res.setHeader("Cache-Control", "no-store")

        return res.status(200).send(report.buffer)
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getProjectVelocityController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const projectId = req.params.projectId
        if (typeof projectId !== "string") {
            return res.status(400).json({ success: false, message: "projectId invalido" })
        }

        const result = await getProjectVelocityUseCase(projectId, req.userId)

        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message })
    }
}

export const getProjectStoryPointsController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const projectId = req.params.projectId
        if (typeof projectId !== "string") {
            return res.status(400).json({ success: false, message: "projectId invalido" })
        }

        const result = await getProjectStoryPointsUseCase(projectId, req.userId)

        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message })
    }
}