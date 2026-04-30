import { updateProject, getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { ProjectPriority, ProjectStatus } from "../../entities/Project"

export const updateProjectUseCase = async (
    projectId: string,
    userId: string,
    data: {
        name?: string
        description?: string | null
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

    return updated
}