import { Response } from "express"
import { AuthenticatedRequest } from "../middlewares/requireAuth"
import { recommendAssignees } from "../use-cases/assignment/RecommendAssignees"

export const recommendAssigneesController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const scope = req.body.scope === "task" ? "task" : "project"
        const title = typeof req.body.title === "string" ? req.body.title : ""
        const description = typeof req.body.description === "string" ? req.body.description : null
        const projectId = typeof req.body.projectId === "string" && req.body.projectId.trim().length > 0 ? req.body.projectId : null
        const limit = Number.isFinite(Number(req.body.limit)) ? Math.max(1, Math.min(8, Number(req.body.limit))) : 5

        const result = await recommendAssignees({
            scope,
            title,
            description,
            projectId,
            limit
        })

        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}