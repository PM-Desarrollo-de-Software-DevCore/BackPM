import { Response } from "express"
import { AuthenticatedRequest } from "../middlewares/requireAuth"
import { GlobalRole } from "../entities/User"
import { ProjectRole } from "../entities/MemberProject"
import { addMemberToProjectUseCase } from "../use-cases/memberProjects/AddMemberToProject"
import { getProjectMembersUseCase } from "../use-cases/memberProjects/GetProjectMembers"
import { updateMemberRoleUseCase } from "../use-cases/memberProjects/UpdateMemberRole"
import { removeMemberFromProjectUseCase } from "../use-cases/memberProjects/RemoveMemberFromProject"
import { getCurrentUser } from "../use-cases/auth/GetCurrentUser"

export const addMemberController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const user = await getCurrentUser(req.userId)
        const projectId = req.params.projectId as string
        const userId = req.body.userId as string
        const role = req.body.role as ProjectRole

        const result = await addMemberToProjectUseCase(
            projectId,
            userId,
            role,
            req.userId,
            user.role as GlobalRole
        )

        return res.status(201).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getProjectMembersController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const projectId = req.params.projectId as string
        const result = await getProjectMembersUseCase(projectId, req.userId)

        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const updateMemberRoleController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const user = await getCurrentUser(req.userId)
        const projectId = req.params.projectId as string
        const userId = req.params.userId as string
        const role = req.body.role as ProjectRole

        const result = await updateMemberRoleUseCase(
            projectId,
            userId,
            role,
            req.userId,
            user.role as GlobalRole
        )

        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const removeMemberController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const user = await getCurrentUser(req.userId)
        const projectId = req.params.projectId as string
        const userId = req.params.userId as string

        const result = await removeMemberFromProjectUseCase(
            projectId,
            userId,
            req.userId,
            user.role as GlobalRole
        )

        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}