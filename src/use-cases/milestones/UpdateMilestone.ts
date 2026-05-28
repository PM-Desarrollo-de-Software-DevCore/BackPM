import { getMilestoneById, updateMilestone } from "../../infrastructure/repositories/MilestoneRepository"
import { getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { Milestone } from "../../entities/Milestone"
import { ProjectRole } from "../../entities/MemberProject"

export const updateMilestoneUseCase = async (
    milestoneId: string,
    userId: string,
    data: {
        title?: string
        description?: string | null
        due_date?: Date
        completed?: boolean
    }
): Promise<Milestone> => {
    const milestone = await getMilestoneById(milestoneId)
    if (!milestone) {
        throw new Error("Hito no encontrado")
    }

    let userRole = await getUserRoleInProject(userId, milestone.id_project)
    if (!userRole) {
        const project = await getProjectById(milestone.id_project)
        if (project && project.createdBy === userId) {
            userRole = ProjectRole.PROJECT_MANAGER
        }
    }
    if (!userRole || (userRole !== ProjectRole.PROJECT_MANAGER && userRole !== ProjectRole.SCRUM_MASTER)) {
        throw new Error("Solo project_manager y scrum_master pueden actualizar hitos")
    }

    if (data.due_date !== undefined && (!(data.due_date instanceof Date) || isNaN(data.due_date.getTime()))) {
        throw new Error("La fecha del hito (due_date) no es válida")
    }
    if (data.title !== undefined && data.title.trim().length === 0) {
        throw new Error("El título no puede estar vacío")
    }

    // Construir un patch solo con columnas reales; "completed" se traduce a completedAt
    const patch: Partial<Omit<Milestone, "id_milestone" | "createdAt">> = {}
    if (data.title !== undefined) patch.title = data.title
    if (data.description !== undefined) patch.description = data.description
    if (data.due_date !== undefined) patch.due_date = data.due_date
    if (data.completed !== undefined) {
        patch.completedAt = data.completed ? (milestone.completedAt ?? new Date()) : null
    }

    const updated = await updateMilestone(milestoneId, patch)
    if (!updated) {
        throw new Error("No se pudo actualizar el hito")
    }
    return updated
}
