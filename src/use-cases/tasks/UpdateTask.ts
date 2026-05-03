import { getTaskById, updateTask } from "../../infrastructure/repositories/TaskRepository"
import { getUserRoleInProject, isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { getSprintById } from "../../infrastructure/repositories/SprintRepository"
import { TaskPriority, TaskStatus } from "../../entities/Task"
import { ProjectRole } from "../../entities/MemberProject"

export const updateTaskUseCase = async (
    taskId: string,
    userId: string,
    data: {
        title?: string
        description?: string | null
        task_number?: number
        progress?: number
        priority?: TaskPriority
        status?: TaskStatus
        start_date?: Date
        end_date?: Date | null
        id_sprint?: string | null
        assignedTo?: string | null
    }
) => {
    const task = await getTaskById(taskId)
    if (!task) {
        throw new Error("Tarea no encontrada")
    }

    const userRole = await getUserRoleInProject(userId, task.id_project)
    const isPMorSM = userRole === ProjectRole.PROJECT_MANAGER || userRole === ProjectRole.SCRUM_MASTER
    const isAssigned = task.assignedTo === userId

    if (!isPMorSM && !isAssigned) {
        throw new Error("No tienes permisos para actualizar esta tarea")
    }

    const newStart = data.start_date ?? task.start_date
    const newEnd = data.end_date !== undefined ? data.end_date : task.end_date
    if (newEnd && newStart > newEnd) {
        throw new Error("La fecha de inicio debe ser anterior a la fecha de fin")
    }

    if (data.task_number !== undefined) {
        if (!Number.isInteger(data.task_number) || data.task_number < 1) {
            throw new Error("El número de tarea debe ser un entero mayor o igual a 1")
        }
    }

    if (data.progress !== undefined) {
        if (!Number.isFinite(data.progress) || data.progress < 0 || data.progress > 100) {
            throw new Error("El progreso debe estar entre 0 y 100")
        }
    }

    if (data.id_sprint) {
        const sprint = await getSprintById(data.id_sprint)
        if (!sprint) {
            throw new Error("Sprint no encontrado")
        }
        if (sprint.id_project !== task.id_project) {
            throw new Error("El sprint no pertenece al proyecto")
        }
    }

    if (data.assignedTo) {
        const isMember = await isMemberProject(data.assignedTo, task.id_project)
        if (!isMember) {
            throw new Error("El usuario asignado no es miembro del proyecto")
        }
    }

    const updated = await updateTask(taskId, data)
    if (!updated) {
        throw new Error("No se pudo actualizar la tarea")
    }

    return updated
}
