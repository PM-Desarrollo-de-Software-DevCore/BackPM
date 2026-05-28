import { countOverdueMilestonesByProjects } from "../../infrastructure/repositories/MilestoneRepository"
import { getProjectsByUser } from "../../infrastructure/repositories/ProjectRepository"

export interface OverdueMilestonesSummary {
    overdueMilestones: number
    projectsConsidered: number
}

// Numero total de hitos retrasados across todos los proyectos del usuario (creados o donde es miembro)
export const getOverdueMilestonesSummaryUseCase = async (
    userId: string
): Promise<OverdueMilestonesSummary> => {
    const projects = await getProjectsByUser(userId)
    const projectIds = projects.map((p) => p.id_project)

    const overdueMilestones = await countOverdueMilestonesByProjects(projectIds, new Date())

    return { overdueMilestones, projectsConsidered: projectIds.length }
}
