import { updateProject, getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { ProjectPriority, ProjectStatus, ProjectMethodology, ProjectBillingModel } from "../../entities/Project"
import { notifyProjectCompleted } from "../../infrastructure/services/notificationService"

export const updateProjectUseCase = async (
    projectId: string,
    userId: string,
    data: {
        name?: string
        description?: string | null
        client?: string
        project_type?: string
        project_objective?: string | null
        methodology?: ProjectMethodology
        estimated_sprints?: number | null
        budget?: number | null
        monthly_cost?: number | null
        billing_model?: ProjectBillingModel | null
        start_date?: Date
        end_date?: Date | null
        priority?: ProjectPriority
        status?: ProjectStatus
    }
) => {
    const project = await getProjectById(projectId)

    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    const role = await getUserRoleInProject(userId, projectId)
    const canEdit =
        project.createdBy === userId ||
        role === "project_manager" ||
        role === "scrum_master"

    if (!canEdit) {
        throw new Error("No tienes permisos para editar este proyecto")
    }

    if (data.start_date && data.end_date && data.start_date > data.end_date) {
        throw new Error("La fecha de inicio debe ser anterior a la fecha de fin")
    }

    const updated = await updateProject(projectId, data)

    if (!updated) {
        throw new Error("No se pudo actualizar el proyecto")
    }

    if (project.status !== ProjectStatus.COMPLETED && updated.status === ProjectStatus.COMPLETED) {
        await notifyProjectCompleted(projectId, userId)
    }

    return updated
}