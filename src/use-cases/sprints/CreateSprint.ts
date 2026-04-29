import { createSprint } from "../../infrastructure/repositories/SprintRepository"
import { getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { Sprint, SprintStatus } from "../../entities/Sprint"
import { ProjectRole } from "../../entities/MemberProject"

export const createSprintUseCase = async (
    name: string,
    start_date: Date,
    end_date: Date,
    status: SprintStatus,
    id_project: string,
    userId: string
): Promise<Sprint> => {
    // Validar que existe el proyecto
    const project = await getProjectById(id_project)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    // Validar permisos: solo project_manager y scrum_master pueden crear sprints
    const userRole = await getUserRoleInProject(userId, id_project)

    if (!userRole) {
        throw new Error("No tienes permisos en este proyecto")
    }

    if (userRole !== ProjectRole.PROJECT_MANAGER && userRole !== ProjectRole.SCRUM_MASTER) {
        throw new Error("Solo project_manager y scrum_master pueden crear sprints")
    }

    // Validar fechas
    if (start_date > end_date) {
        throw new Error("La fecha de inicio debe ser anterior a la fecha de fin")
    }

    if (start_date < new Date()) {
        throw new Error("La fecha de inicio no puede ser en el pasado")
    }

    return await createSprint({
        name,
        start_date,
        end_date,
        status,
        id_project
    })
}