import {
    countMilestonesByProject,
    countOverdueMilestonesByProject
} from "../../infrastructure/repositories/MilestoneRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"

export interface OverdueMilestonesCount {
    projectId: string
    overdueMilestones: number
    totalMilestones: number
}

// Numero de hitos retrasados de un proyecto (due_date < hoy y no completados)
export const getOverdueMilestonesCountUseCase = async (
    projectId: string,
    userId: string
): Promise<OverdueMilestonesCount> => {
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    const isMember = await isMemberProject(userId, projectId)
    if (!isMember && project.createdBy !== userId) {
        throw new Error("No tienes acceso a los hitos de este proyecto")
    }

    const now = new Date()
    const [overdueMilestones, totalMilestones] = await Promise.all([
        countOverdueMilestonesByProject(projectId, now),
        countMilestonesByProject(projectId)
    ])

    return { projectId, overdueMilestones, totalMilestones }
}
