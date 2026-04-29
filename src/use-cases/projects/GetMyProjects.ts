import { getProjectsByUser } from "../../infrastructure/repositories/ProjectRepository"

export const getMyProjectsUseCase = async (userId: string) => {
    return await getProjectsByUser(userId)
}