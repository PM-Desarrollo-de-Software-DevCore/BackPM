import { Response } from "express"
import { AuthenticatedRequest } from "../middlewares/requireAuth"
import { getProjectsStatsUseCase } from "../use-cases/dashboard/GetProjectsStats"
import { getTasksStatsUseCase } from "../use-cases/dashboard/GetTasksStats"
import { getUserTasksUseCase } from "../use-cases/dashboard/GetUserTasks"
import { getWeeklyProgressUseCase } from "../use-cases/dashboard/GetWeeklyProgress"
import { getFinancialPortfolioUseCase } from "../use-cases/dashboard/GetFinancialPortfolio"
import { getMilestonesOverviewUseCase } from "../use-cases/dashboard/GetMilestonesOverview"
import { getSearchIndexUseCase } from "../use-cases/dashboard/GetSearchIndex"
import { getProjectsMembersUseCase } from "../use-cases/dashboard/GetProjectsMembers"
import { getWeeklyVelocityUseCase } from "../use-cases/dashboard/GetWeeklyVelocity"
import { getWorklogOverviewUseCase } from "../use-cases/dashboard/GetWorklogOverview"

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

export const getMilestonesOverviewController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const result = await getMilestonesOverviewUseCase(req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getSearchIndexController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const result = await getSearchIndexUseCase(req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getProjectsMembersController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const result = await getProjectsMembersUseCase(req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getWeeklyVelocityController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const filters: { projectId?: string; weeks?: string } = {}
        if (typeof req.query.projectId === "string") filters.projectId = req.query.projectId
        if (typeof req.query.weeks === "string") filters.weeks = req.query.weeks

        const result = await getWeeklyVelocityUseCase(req.userId, filters)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getWorklogOverviewController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const projectId = typeof req.query.projectId === "string" ? req.query.projectId : ""
        if (!projectId) {
            return res.status(400).json({ success: false, message: "projectId es requerido" })
        }

        const weeksRaw = typeof req.query.weeks === "string" ? Number(req.query.weeks) : 5
        const weeks = Number.isInteger(weeksRaw) && weeksRaw > 0 ? weeksRaw : 5

        const result = await getWorklogOverviewUseCase(req.userId, projectId, weeks)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}
