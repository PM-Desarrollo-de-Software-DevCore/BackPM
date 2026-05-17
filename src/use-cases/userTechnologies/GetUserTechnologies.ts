import { findUserById } from "../../infrastructure/repositories/UserRepository"
import { getUserTechnologiesByUser } from "../../infrastructure/repositories/UserTechnologyRepository"

export const getUserTechnologiesUseCase = async (targetUserId: string) => {
    const target = await findUserById(targetUserId)
    if (!target) {
        throw new Error("Usuario no encontrado")
    }

    return await getUserTechnologiesByUser(targetUserId)
}
