import { getSprintById, deleteSprint } from "../../infrastructure/repositories/SprintRepository"
import { getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { ProjectRole } from "../../entities/MemberProject"

export const deleteSprintUseCase = async (sprintId: string, userId: string) => {
    const sprint = await getSprintById(sprintId)
    if (!sprint) {
        throw new Error("Sprint no encontrado")
    }

    // Validar permisos: solo project_manager puede eliminar sprints
    const userRole = await getUserRoleInProject(userId, sprint.id_project)
    if (userRole !== ProjectRole.PROJECT_MANAGER) {
        throw new Error("Solo project_manager puede eliminar sprints")
    }

    const deleted = await deleteSprint(sprintId)
    if (!deleted) {
        throw new Error("No se pudo eliminar el sprint")
    }

    return { message: "Sprint eliminado correctamente" }
}