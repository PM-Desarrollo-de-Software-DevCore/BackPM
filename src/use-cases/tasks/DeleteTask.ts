import { getTaskById, deleteTask } from "../../infrastructure/repositories/TaskRepository"
import { getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { ProjectRole } from "../../entities/MemberProject"

export const deleteTaskUseCase = async (taskId: string, userId: string) => {
    const task = await getTaskById(taskId)
    if (!task) {
        throw new Error("Tarea no encontrada")
    }

    const userRole = await getUserRoleInProject(userId, task.id_project)
    if (userRole !== ProjectRole.PROJECT_MANAGER) {
        throw new Error("Solo project_manager puede eliminar tareas")
    }

    const deleted = await deleteTask(taskId)
    if (!deleted) {
        throw new Error("No se pudo eliminar la tarea")
    }

    return { message: "Tarea eliminada correctamente" }
}
