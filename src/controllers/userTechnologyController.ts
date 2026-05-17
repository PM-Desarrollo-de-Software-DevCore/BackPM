import { Response, Request } from "express"
import { AuthenticatedRequest } from "../middlewares/requireAuth"
import { addUserTechnologyUseCase } from "../use-cases/userTechnologies/AddUserTechnology"
import { getUserTechnologiesUseCase } from "../use-cases/userTechnologies/GetUserTechnologies"
import { getUserTechnologyByIdUseCase } from "../use-cases/userTechnologies/GetUserTechnologyById"
import { updateUserTechnologyUseCase } from "../use-cases/userTechnologies/UpdateUserTechnology"
import { deleteUserTechnologyUseCase } from "../use-cases/userTechnologies/DeleteUserTechnology"

type UserParams = { id: string }
type TechParams = { techId: string }

type UserRequest = AuthenticatedRequest & Request<UserParams>
type TechRequest = AuthenticatedRequest & Request<TechParams>

export const addUserTechnologyController = async (req: UserRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { id: targetUserId } = req.params
        const { technology, yearsOfExperience } = req.body

        const result = await addUserTechnologyUseCase(
            targetUserId,
            req.userId,
            technology,
            yearsOfExperience
        )
        return res.status(201).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getUserTechnologiesController = async (req: UserRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { id: targetUserId } = req.params
        const result = await getUserTechnologiesUseCase(targetUserId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message })
    }
}

export const getUserTechnologyByIdController = async (req: TechRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { techId } = req.params
        const result = await getUserTechnologyByIdUseCase(techId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message })
    }
}

export const updateUserTechnologyController = async (req: TechRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { techId } = req.params
        const { technology, yearsOfExperience } = req.body

        const result = await updateUserTechnologyUseCase(techId, req.userId, {
            technology,
            yearsOfExperience
        })
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const deleteUserTechnologyController = async (req: TechRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { techId } = req.params
        const result = await deleteUserTechnologyUseCase(techId, req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}
