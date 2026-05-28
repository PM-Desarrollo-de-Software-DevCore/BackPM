import { getMilestoneById, deleteMilestone } from "../../infrastructure/repositories/MilestoneRepository"
import { getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { ProjectRole } from "../../entities/MemberProject"

export const deleteMilestoneUseCase = async (milestoneId: string, userId: string) => {
    const milestone = await getMilestoneById(milestoneId)
    if (!milestone) {
        throw new Error("Hito no encontrado")
    }

    // Solo project_manager puede eliminar hitos
    let userRole = await getUserRoleInProject(userId, milestone.id_project)
    if (!userRole) {
        const project = await getProjectById(milestone.id_project)
        if (project && project.createdBy === userId) {
            userRole = ProjectRole.PROJECT_MANAGER
        }
    }
    if (userRole !== ProjectRole.PROJECT_MANAGER) {
        throw new Error("Solo project_manager puede eliminar hitos")
    }

    const deleted = await deleteMilestone(milestoneId)
    if (!deleted) {
        throw new Error("No se pudo eliminar el hito")
    }
    return { message: "Hito eliminado correctamente" }
}
