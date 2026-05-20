import { getSprintById, deleteSprint } from "../../infrastructure/repositories/SprintRepository"
import { getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { ProjectRole } from "../../entities/MemberProject"

export const deleteSprintUseCase = async (sprintId: string, userId: string) => {
    const sprint = await getSprintById(sprintId)
    if (!sprint) {
        throw new Error("Sprint no encontrado")
    }

    // Validar permisos: solo project_manager puede eliminar sprints
    let userRole = await getUserRoleInProject(userId, sprint.id_project)
    if (!userRole) {
        const project = await getProjectById(sprint.id_project)
        if (project && project.createdBy === userId) {
            userRole = ProjectRole.PROJECT_MANAGER
        }
    }
    if (userRole !== ProjectRole.PROJECT_MANAGER) {
        throw new Error("Solo project_manager puede eliminar sprints")
    }

    const deleted = await deleteSprint(sprintId)
    if (!deleted) {
        throw new Error("No se pudo eliminar el sprint")
    }

    return { message: "Sprint eliminado correctamente" }
}