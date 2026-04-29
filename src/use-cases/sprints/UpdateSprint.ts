import { getSprintById, updateSprint } from "../../infrastructure/repositories/SprintRepository"
import { getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { SprintStatus } from "../../entities/Sprint"
import { ProjectRole } from "../../entities/MemberProject"

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
    const userRole = await getUserRoleInProject(userId, sprint.id_project)
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

    return updated
}