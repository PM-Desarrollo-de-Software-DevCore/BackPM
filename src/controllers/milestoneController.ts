import { Response, Request } from "express"
import { AuthenticatedRequest } from "../middlewares/requireAuth"
import { createMilestoneUseCase } from "../use-cases/milestones/CreateMilestone"
import { getMilestonesByProjectUseCase } from "../use-cases/milestones/GetMilestonesByProject"
import { getMilestoneByIdUseCase } from "../use-cases/milestones/GetMilestoneById"
import { updateMilestoneUseCase } from "../use-cases/milestones/UpdateMilestone"
import { deleteMilestoneUseCase } from "../use-cases/milestones/DeleteMilestone"
import { getOverdueMilestonesCountUseCase } from "../use-cases/milestones/GetOverdueMilestonesCount"
import { getOverdueMilestonesSummaryUseCase } from "../use-cases/milestones/GetOverdueMilestonesSummary"

type ProjectParams = { projectId: string }
type MilestoneParams = { milestoneId: string }

type ProjectRequest = AuthenticatedRequest & Request<ProjectParams>
type MilestoneRequest = AuthenticatedRequest & Request<MilestoneParams>

export const createMilestoneController = async (req: ProjectRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { projectId } = req.params
        const { title, description, due_date } = req.body

        if (!title) {
            return res.status(400).json({ success: false, message: "El título es obligatorio" })
        }
        if (!due_date) {
            return res.status(400).json({ success: false, message: "due_date es obligatorio" })
        }

        const result = await createMilestoneUseCase(
            { title, description: description ?? null, due_date: new Date(due_date) },
            projectId,
            req.userId
        )

        return res.status(201).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getMilestonesByProjectController = async (req: ProjectRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { projectId } = req.params
        const result = await getMilestonesByProjectUseCase(projectId, req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getOverdueMilestonesCountController = async (req: ProjectRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { projectId } = req.params
        const result = await getOverdueMilestonesCountUseCase(projectId, req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getOverdueMilestonesSummaryController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const result = await getOverdueMilestonesSummaryUseCase(req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getMilestoneByIdController = async (req: MilestoneRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { milestoneId } = req.params
        const result = await getMilestoneByIdUseCase(milestoneId, req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message })
    }
}

export const updateMilestoneController = async (req: MilestoneRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { milestoneId } = req.params
        const body = req.body

        const result = await updateMilestoneUseCase(milestoneId, req.userId, {
            ...body,
            due_date: body.due_date !== undefined
                ? (body.due_date ? new Date(body.due_date) : undefined)
                : undefined
        })

        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const deleteMilestoneController = async (req: MilestoneRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { milestoneId } = req.params
        const result = await deleteMilestoneUseCase(milestoneId, req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}
