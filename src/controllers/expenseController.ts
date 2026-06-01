import { Response } from "express"
import { AuthenticatedRequest } from "../middlewares/requireAuth"
import { GlobalRole } from "../entities/User"
import { getCurrentUser } from "../use-cases/auth/GetCurrentUser"
import { createExpenseUseCase } from "../use-cases/expenses/CreateExpense"
import { getExpensesByProjectUseCase } from "../use-cases/expenses/GetExpensesByProject"
import { updateExpenseUseCase } from "../use-cases/expenses/UpdateExpense"
import { deleteExpenseUseCase } from "../use-cases/expenses/DeleteExpense"

export const createExpenseController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const user = await getCurrentUser(req.userId)
        const projectId = req.params.projectId as string

        // req.body ya viene validado por zod (amount, category, date y description opcional).
        const result = await createExpenseUseCase(projectId, req.userId, user.role as GlobalRole, req.body)
        return res.status(201).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getExpensesByProjectController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const projectId = req.params.projectId as string
        const result = await getExpensesByProjectUseCase(projectId, req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message })
    }
}

export const updateExpenseController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const user = await getCurrentUser(req.userId)
        const expenseId = req.params.expenseId as string

        const result = await updateExpenseUseCase(expenseId, req.userId, user.role as GlobalRole, req.body)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const deleteExpenseController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const user = await getCurrentUser(req.userId)
        const expenseId = req.params.expenseId as string

        const result = await deleteExpenseUseCase(expenseId, req.userId, user.role as GlobalRole)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}
