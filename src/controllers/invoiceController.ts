import { Response } from "express"
import { AuthenticatedRequest } from "../middlewares/requireAuth"
import { GlobalRole } from "../entities/User"
import { getCurrentUser } from "../use-cases/auth/GetCurrentUser"
import { createInvoiceUseCase } from "../use-cases/invoices/CreateInvoice"
import { getSuggestedInvoiceAmountUseCase } from "../use-cases/invoices/ComputeInvoiceAmount"
import { getProjectInvoicesUseCase } from "../use-cases/invoices/GetProjectInvoices"
import { updateInvoiceUseCase } from "../use-cases/invoices/UpdateInvoice"
import { deleteInvoiceUseCase } from "../use-cases/invoices/DeleteInvoice"

export const createInvoiceController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const user = await getCurrentUser(req.userId)
        const projectId = req.params.projectId as string

        // req.body ya viene validado por zod.
        const result = await createInvoiceUseCase(projectId, req.userId, user.role as GlobalRole, req.body)
        return res.status(201).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

// Preview del monto auto-calculado para una factura T&M en un periodo, sin crearla.
// period_start y period_end llegan como query params (ISO). Solo admin/PM (gating en el use-case).
export const getSuggestedInvoiceAmountController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const user = await getCurrentUser(req.userId)
        const projectId = req.params.projectId as string
        const start = new Date(String(req.query.period_start))
        const end = new Date(String(req.query.period_end))
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ success: false, message: "period_start y period_end son requeridos (fechas validas)" })
        }

        const result = await getSuggestedInvoiceAmountUseCase(projectId, req.userId, user.role as GlobalRole, start, end)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getProjectInvoicesController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const projectId = req.params.projectId as string
        const result = await getProjectInvoicesUseCase(projectId, req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message })
    }
}

export const updateInvoiceController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const user = await getCurrentUser(req.userId)
        const invoiceId = req.params.invoiceId as string

        const result = await updateInvoiceUseCase(invoiceId, req.userId, user.role as GlobalRole, req.body)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const deleteInvoiceController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const user = await getCurrentUser(req.userId)
        const invoiceId = req.params.invoiceId as string

        const result = await deleteInvoiceUseCase(invoiceId, req.userId, user.role as GlobalRole)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}
