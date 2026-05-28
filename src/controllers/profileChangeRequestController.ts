import { Response, Request } from "express"
import { AuthenticatedRequest } from "../middlewares/requireAuth"
import { createProfileChangeRequestUseCase } from "../use-cases/profileChangeRequests/CreateProfileChangeRequest"
import { getMyProfileChangeRequestsUseCase } from "../use-cases/profileChangeRequests/GetMyProfileChangeRequests"
import { getAllProfileChangeRequestsUseCase } from "../use-cases/profileChangeRequests/GetAllProfileChangeRequests"
import { approveProfileChangeRequestUseCase } from "../use-cases/profileChangeRequests/ApproveProfileChangeRequest"
import { rejectProfileChangeRequestUseCase } from "../use-cases/profileChangeRequests/RejectProfileChangeRequest"
import { cancelProfileChangeRequestUseCase } from "../use-cases/profileChangeRequests/CancelProfileChangeRequest"

type RequestIdParams = { requestId: string }
type RequestIdRequest = AuthenticatedRequest & Request<RequestIdParams>

export const createProfileChangeRequestController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }
        const changes = (req.body && typeof req.body === "object" ? req.body.proposedChanges ?? req.body : {}) as Record<string, unknown>
        const result = await createProfileChangeRequestUseCase(req.userId, changes)
        return res.status(201).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getMyProfileChangeRequestsController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }
        const result = await getMyProfileChangeRequestsUseCase(req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getAllProfileChangeRequestsController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }
        const filters: { status?: string } = {}
        if (typeof req.query.status === "string") filters.status = req.query.status
        const result = await getAllProfileChangeRequestsUseCase(req.userId, filters)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const approveProfileChangeRequestController = async (req: RequestIdRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }
        const result = await approveProfileChangeRequestUseCase(req.params.requestId, req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const rejectProfileChangeRequestController = async (req: RequestIdRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }
        const note = typeof req.body?.reviewNote === "string" ? req.body.reviewNote : null
        const result = await rejectProfileChangeRequestUseCase(req.params.requestId, req.userId, note)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const cancelProfileChangeRequestController = async (req: RequestIdRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }
        const result = await cancelProfileChangeRequestUseCase(req.params.requestId, req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}
