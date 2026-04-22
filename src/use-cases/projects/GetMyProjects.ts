import { getProjectsByUser } from "../../infrastructure/repositories/projectRepository"

export const getMyProjectsUseCase = async (userId: string) => {
    return await getProjectsByUser(userId)
}