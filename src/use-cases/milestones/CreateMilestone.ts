import { createMilestone } from "../../infrastructure/repositories/MilestoneRepository"
import { getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { Milestone } from "../../entities/Milestone"
import { ProjectRole } from "../../entities/MemberProject"

export const createMilestoneUseCase = async (
    data: { title: string; description?: string | null; due_date: Date },
    projectId: string,
    userId: string
): Promise<Milestone> => {
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    // Solo project_manager y scrum_master pueden crear hitos (el creador del proyecto cuenta como PM)
    let userRole = await getUserRoleInProject(userId, projectId)
    if (!userRole) {
        if (project.createdBy === userId) {
            userRole = ProjectRole.PROJECT_MANAGER
        } else {
            throw new Error("No tienes permisos en este proyecto")
        }
    }
    if (userRole !== ProjectRole.PROJECT_MANAGER && userRole !== ProjectRole.SCRUM_MASTER) {
        throw new Error("Solo project_manager y scrum_master pueden crear hitos")
    }

    if (!data.title || data.title.trim().length === 0) {
        throw new Error("El título es obligatorio")
    }
    if (!(data.due_date instanceof Date) || isNaN(data.due_date.getTime())) {
        throw new Error("La fecha del hito (due_date) no es válida")
    }

    return await createMilestone({
        title: data.title,
        description: data.description ?? null,
        due_date: data.due_date,
        completedAt: null,
        id_project: projectId,
        createdBy: userId
    })
}
