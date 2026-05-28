import { getMilestoneById } from "../../infrastructure/repositories/MilestoneRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { decorateMilestone, MilestoneWithFlags } from "./GetMilestonesByProject"

export const getMilestoneByIdUseCase = async (
    milestoneId: string,
    userId: string
): Promise<MilestoneWithFlags> => {
    const milestone = await getMilestoneById(milestoneId)
    if (!milestone) {
        throw new Error("Hito no encontrado")
    }

    const project = await getProjectById(milestone.id_project)
    const isMember = await isMemberProject(userId, milestone.id_project)
    if (!isMember && project?.createdBy !== userId) {
        throw new Error("No tienes acceso a este hito")
    }

    return decorateMilestone(milestone, new Date())
}
