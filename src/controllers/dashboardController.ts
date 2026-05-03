import { Response } from "express"
import { AuthenticatedRequest } from "../middlewares/requireAuth"
import { getProjectsStatsUseCase } from "../use-cases/dashboard/GetProjectsStats"

export const getProjectsStatsController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const result = await getProjectsStatsUseCase(req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}
