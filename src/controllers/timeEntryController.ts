import { Response } from "express"
import { AuthenticatedRequest } from "../middlewares/requireAuth"
import { GlobalRole } from "../entities/User"
import { getCurrentUser } from "../use-cases/auth/GetCurrentUser"
import { createTimeEntryUseCase } from "../use-cases/timeEntries/CreateTimeEntry"
import { getTimeEntriesByTaskUseCase } from "../use-cases/timeEntries/GetTimeEntriesByTask"
import { updateTimeEntryUseCase } from "../use-cases/timeEntries/UpdateTimeEntry"
import { deleteTimeEntryUseCase } from "../use-cases/timeEntries/DeleteTimeEntry"
import { getProjectTimeSummaryUseCase } from "../use-cases/timeEntries/GetProjectTimeSummary"

export const createTimeEntryController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const taskId = req.params.taskId as string
        const { hours, work_date, description } = req.body

        const result = await createTimeEntryUseCase(taskId, req.userId, hours, work_date, description ?? null)
        return res.status(201).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getTimeEntriesByTaskController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const taskId = req.params.taskId as string
        const result = await getTimeEntriesByTaskUseCase(taskId, req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getProjectTimeSummaryController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const projectId = req.params.projectId as string
        const result = await getProjectTimeSummaryUseCase(projectId, req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message })
    }
}

export const updateTimeEntryController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const user = await getCurrentUser(req.userId)
        const timeEntryId = req.params.timeEntryId as string

        // req.body ya viene validado por zod (solo hours/work_date/description provistos).
        const result = await updateTimeEntryUseCase(timeEntryId, req.userId, user.role as GlobalRole, req.body)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const deleteTimeEntryController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const user = await getCurrentUser(req.userId)
        const timeEntryId = req.params.timeEntryId as string

        const result = await deleteTimeEntryUseCase(timeEntryId, req.userId, user.role as GlobalRole)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}
