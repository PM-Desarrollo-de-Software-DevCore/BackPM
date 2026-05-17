import { getUserTechnologyById } from "../../infrastructure/repositories/UserTechnologyRepository"

export const getUserTechnologyByIdUseCase = async (id: string) => {
    const tech = await getUserTechnologyById(id)
    if (!tech) {
        throw new Error("Tecnologia no encontrada")
    }
    return tech
}
