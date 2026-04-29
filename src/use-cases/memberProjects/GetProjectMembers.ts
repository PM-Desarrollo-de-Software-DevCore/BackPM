import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { getProjectMembers } from "../../infrastructure/repositories/MemberProjectRepository"

export const getProjectMembersUseCase = async (projectId: string, requestingUserId: string) => {
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    const members = await getProjectMembers(projectId)
    return members
}