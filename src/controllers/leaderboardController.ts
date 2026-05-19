import { Response, Request } from "express"
import { AuthenticatedRequest } from "../middlewares/requireAuth"
import { getGlobalLeaderboardUseCase } from "../use-cases/leaderboard/GetGlobalLeaderboard"
import { getProjectLeaderboardUseCase } from "../use-cases/leaderboard/GetProjectLeaderboard"

type ProjectParams = { projectId: string }
type ProjectLeaderboardRequest = AuthenticatedRequest & Request<ProjectParams>

const DEFAULT_LIMIT = 5
const MAX_LIMIT = 100

const parseLimit = (raw: unknown): number => {
    if (raw === undefined) return DEFAULT_LIMIT
    const n = Number(raw)
    if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT
    return Math.min(Math.floor(n), MAX_LIMIT)
}

export const getGlobalLeaderboardController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const limit = parseLimit(req.query.limit)
        const data = await getGlobalLeaderboardUseCase(limit)
        return res.status(200).json({ success: true, data })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getProjectLeaderboardController = async (req: ProjectLeaderboardRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { projectId } = req.params
        const limit = parseLimit(req.query.limit)
        const data = await getProjectLeaderboardUseCase(projectId, req.userId, limit)
        return res.status(200).json({ success: true, data })
    } catch (error: any) {
        const status = error.message === "No tienes acceso a este proyecto" ? 403 : 400
        return res.status(status).json({ success: false, message: error.message })
    }
}
