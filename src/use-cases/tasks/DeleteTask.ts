import { getTaskById, deleteTask } from "../../infrastructure/repositories/TaskRepository"
import { getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { ProjectRole } from "../../entities/MemberProject"

export const deleteTaskUseCase = async (taskId: string, userId: string) => {
    const task = await getTaskById(taskId)
    if (!task) {
        throw new Error("Tarea no encontrada")
    }

    let userRole = await getUserRoleInProject(userId, task.id_project)
    if (!userRole) {
        const project = await getProjectById(task.id_project)
        if (project && project.createdBy === userId) {
            userRole = ProjectRole.PROJECT_MANAGER
        }
    }
    if (userRole !== ProjectRole.PROJECT_MANAGER) {
        throw new Error("Solo project_manager puede eliminar tareas")
    }

    const deleted = await deleteTask(taskId)
    if (!deleted) {
        throw new Error("No se pudo eliminar la tarea")
    }

    return { message: "Tarea eliminada correctamente" }
}
