import { getSprintById, updateSprint } from "../../infrastructure/repositories/SprintRepository"
import { getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { SprintStatus } from "../../entities/Sprint"
import { ProjectRole } from "../../entities/MemberProject"
import { notifySprintCompleted } from "../../infrastructure/services/notificationService"

export const updateSprintUseCase = async (
    sprintId: string,
    userId: string,
    data: {
        name?: string
        start_date?: Date
        end_date?: Date
        status?: SprintStatus
    }
) => {
    const sprint = await getSprintById(sprintId)
    if (!sprint) {
        throw new Error("Sprint no encontrado")
    }

    // Validar permisos
    let userRole = await getUserRoleInProject(userId, sprint.id_project)
    if (!userRole) {
        const project = await getProjectById(sprint.id_project)
        if (project && project.createdBy === userId) {
            userRole = ProjectRole.PROJECT_MANAGER
        }
    }
    if (!userRole || (userRole !== ProjectRole.PROJECT_MANAGER && userRole !== ProjectRole.SCRUM_MASTER)) {
        throw new Error("Solo project_manager y scrum_master pueden actualizar sprints")
    }

    // Validar fechas si se envían
    if (data.start_date && data.end_date && data.start_date > data.end_date) {
        throw new Error("La fecha de inicio debe ser anterior a la fecha de fin")
    }

    const updated = await updateSprint(sprintId, data)
    if (!updated) {
        throw new Error("No se pudo actualizar el sprint")
    }

    // Aviso a los miembros del proyecto cuando el sprint pasa a finalizado.
    const justFinished =
        data.status !== undefined &&
        data.status !== sprint.status &&
        data.status === SprintStatus.FINISHED
    if (justFinished) {
        await notifySprintCompleted(sprintId, userId)
    }

    return updated
}