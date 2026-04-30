import { Response } from "express"
import { AuthenticatedRequest } from "../middlewares/requireAuth"
import { createProjectUseCase } from "../use-cases/projects/CreateProject"
import { getMyProjectsUseCase } from "../use-cases/projects/GetMyProjects"
import { getProjectByIdUseCase } from "../use-cases/projects/GetProjectById"
import { updateProjectUseCase } from "../use-cases/projects/UpdateProject"
import { deleteProjectUseCase } from "../use-cases/projects/DeleteProject"
import { ProjectPriority, ProjectStatus } from "../entities/Project"

export const createProjectController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { name, description, start_date, end_date, priority, status } = req.body

        const result = await createProjectUseCase(
            name,
            description,
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