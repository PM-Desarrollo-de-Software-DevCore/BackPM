import { getTasksByAssignedUser, AssignedTaskFilters } from "../../infrastructure/repositories/TaskRepository"
import { Task, TaskPriority, TaskStatus } from "../../entities/Task"

const isTaskStatus = (value: string): value is TaskStatus =>
    Object.values(TaskStatus).includes(value as TaskStatus)

const isTaskPriority = (value: string): value is TaskPriority =>
    Object.values(TaskPriority).includes(value as TaskPriority)

export const getMyTasksUseCase = async (
    userId: string,
    rawFilters: { status?: string; priority?: string } = {}
): Promise<Task[]> => {
    const filters: AssignedTaskFilters = {}

    if (rawFilters.status !== undefined) {
        if (!isTaskStatus(rawFilters.status)) {
            throw new Error("status invalido. Valores: pending, in_progress, completed")
        }
        filters.status = rawFilters.status
    }

    if (rawFilters.priority !== undefined) {
        if (!isTaskPriority(rawFilters.priority)) {
            throw new Error("priority invalido. Valores: low, medium, high")
        }
        filters.priority = rawFilters.priority
    }

    return await getTasksByAssignedUser(userId, filters)
}
