import { Response } from "express"
import { AuthenticatedRequest } from "../middlewares/requireAuth"
import { getProjectsStatsUseCase } from "../use-cases/dashboard/GetProjectsStats"
import { getTasksStatsUseCase } from "../use-cases/dashboard/GetTasksStats"
import { getUserTasksUseCase } from "../use-cases/dashboard/GetUserTasks"
import { getWeeklyProgressUseCase } from "../use-cases/dashboard/GetWeeklyProgress"
import { getFinancialPortfolioUseCase } from "../use-cases/dashboard/GetFinancialPortfolio"

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

export const getTasksStatsController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const result = await getTasksStatsUseCase(req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getUserTasksController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const filters: { status?: string; priority?: string } = {}
        if (typeof req.query.status === "string") filters.status = req.query.status
        if (typeof req.query.priority === "string") filters.priority = req.query.priority

        const result = await getUserTasksUseCase(req.userId, filters)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getWeeklyProgressController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const filters: { weekOffset?: string; projectId?: string } = {}
        if (typeof req.query.weekOffset === "string") filters.weekOffset = req.query.weekOffset
        if (typeof req.query.projectId === "string") filters.projectId = req.query.projectId

        const result = await getWeeklyProgressUseCase(req.userId, filters)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getFinancialPortfolioController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const result = await getFinancialPortfolioUseCase(req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}
