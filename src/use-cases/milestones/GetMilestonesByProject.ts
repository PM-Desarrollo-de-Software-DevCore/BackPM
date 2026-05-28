import { getMilestonesByProject } from "../../infrastructure/repositories/MilestoneRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { Milestone } from "../../entities/Milestone"

export interface MilestoneWithFlags extends Milestone {
    completed: boolean
    isOverdue: boolean
}

export const decorateMilestone = (m: Milestone, now: Date): MilestoneWithFlags => ({
    ...m,
    completed: m.completedAt !== null,
    isOverdue: m.completedAt === null && m.due_date.getTime() < now.getTime()
})

export const getMilestonesByProjectUseCase = async (
    projectId: string,
    userId: string
): Promise<MilestoneWithFlags[]> => {
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    const isMember = await isMemberProject(userId, projectId)
    if (!isMember && project.createdBy !== userId) {
        throw new Error("No tienes acceso a los hitos de este proyecto")
    }

    const now = new Date()
    const milestones = await getMilestonesByProject(projectId)
    return milestones.map((m) => decorateMilestone(m, now))
}
