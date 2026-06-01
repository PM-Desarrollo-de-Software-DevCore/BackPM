import { createTimeEntry } from "../../infrastructure/repositories/TimeEntryRepository"
import { getTaskById } from "../../infrastructure/repositories/TaskRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { TimeEntry } from "../../entities/TimeEntry"

export const createTimeEntryUseCase = async (
    taskId: string,
    userId: string,
    hours: number,
    workDate: Date,
    description: string | null
): Promise<TimeEntry> => {
    if (!(hours > 0)) {
        throw new Error("Las horas deben ser mayores a 0")
    }

    const task = await getTaskById(taskId)
    if (!task) {
        throw new Error("Tarea no encontrada")
    }

    const project = await getProjectById(task.id_project)
    if (!project) {
        throw new Error("Proyecto de la tarea no encontrado")
    }

    // Cualquier miembro del proyecto (o su creador) puede registrar su propio tiempo.
    const isMember = await isMemberProject(userId, task.id_project)
    if (!isMember && project.createdBy !== userId) {
        throw new Error("No tienes acceso a esta tarea")
    }

    return await createTimeEntry({
        id_task: taskId,
        id_user: userId,
        id_project: task.id_project,
        hours,
        work_date: workDate,
        description: description ?? null
    })
}
