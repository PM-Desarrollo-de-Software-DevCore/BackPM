import { Response, Request } from "express"
import { AuthenticatedRequest } from "../middlewares/requireAuth"
import { ProgressEntryType } from "../entities/ProgressEntry"
import { createProgressEntryUseCase } from "../use-cases/progressEntries/CreateProgressEntry"
import { getProgressEntriesByProjectUseCase } from "../use-cases/progressEntries/GetProgressEntriesByProject"
import { deleteProgressEntryUseCase } from "../use-cases/progressEntries/DeleteProgressEntry"

type ProjectParams = { projectId: string }
type EntryParams = { entryId: string }

type ProjectRequest = AuthenticatedRequest & Request<ProjectParams>
type EntryRequest = AuthenticatedRequest & Request<EntryParams>

export const createProgressEntryController = async (req: ProjectRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { projectId } = req.params
        const { type, description, date, id_sprint } = req.body

        if (!type) {
            return res.status(400).json({ success: false, message: "type es obligatorio (progress | blocker)" })
        }
        if (!description) {
            return res.status(400).json({ success: false, message: "La descripción es obligatoria" })
        }

        const payload: { type: ProgressEntryType; description: string; date?: Date; id_sprint?: string | null } = {
            type,
            description,
            id_sprint: id_sprint ?? null
        }
        if (date) {
            payload.date = new Date(date)
        }

        const result = await createProgressEntryUseCase(payload, projectId, req.userId)

        return res.status(201).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getProgressEntriesByProjectController = async (req: ProjectRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { projectId } = req.params

        const filters: { type?: ProgressEntryType; sprintId?: string } = {}
        if (typeof req.query.type === "string") filters.type = req.query.type as ProgressEntryType
        if (typeof req.query.sprintId === "string") filters.sprintId = req.query.sprintId

        const result = await getProgressEntriesByProjectUseCase(projectId, req.userId, filters)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const deleteProgressEntryController = async (req: EntryRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { entryId } = req.params
        const result = await deleteProgressEntryUseCase(entryId, req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}
