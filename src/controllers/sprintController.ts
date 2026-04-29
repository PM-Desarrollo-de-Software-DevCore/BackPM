import { Response, Request } from "express"
import { AuthenticatedRequest } from "../middlewares/requireAuth"
import { SprintStatus } from "../entities/Sprint"
import { createSprintUseCase } from "../use-cases/sprints/CreateSprint"
import { getSprintsUseCase } from "../use-cases/sprints/GetSprints"
import { getSprintByIdUseCase } from "../use-cases/sprints/GetSprintById"
import { updateSprintUseCase } from "../use-cases/sprints/UpdateSprint"
import { deleteSprintUseCase } from "../use-cases/sprints/DeleteSprint"

type ProjectParams = { projectId: string }
type SprintParams = { sprintId: string }

type ProjectRequest = AuthenticatedRequest & Request<ProjectParams>
type SprintRequest = AuthenticatedRequest & Request<SprintParams>


export const createSprintController = async (req: ProjectRequest, res: Response) => {    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { projectId } = req.params
        const { name, start_date, end_date, status } = req.body

        const result = await createSprintUseCase(
            name,
            new Date(start_date),
            new Date(end_date),
            status ?? SprintStatus.PLANNED,
            projectId,
            req.userId
        )

        return res.status(201).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getSprintsController = async (req: ProjectRequest, res: Response) => {    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { projectId } = req.params

        const result = await getSprintsUseCase(projectId, req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getSprintByIdController = async (req: SprintRequest, res: Response) => {    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { sprintId } = req.params

        const result = await getSprintByIdUseCase(sprintId, req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message })
    }
}

export const updateSprintController = async (req: SprintRequest, res: Response) => {    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { sprintId } = req.params
        const body = req.body

        const result = await updateSprintUseCase(sprintId, req.userId, {
            ...body,
            start_date: body.start_date ? new Date(body.start_date) : undefined,
            end_date: body.end_date ? new Date(body.end_date) : undefined
        })

        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const deleteSprintController = async (req: SprintRequest, res: Response) => {    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { sprintId } = req.params

        const result = await deleteSprintUseCase(sprintId, req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}