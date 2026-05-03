import {
    getTasksByAssignedUserWithProject,
    AssignedTaskFilters
} from "../../infrastructure/repositories/TaskRepository"
import { Task, TaskPriority, TaskStatus } from "../../entities/Task"

export interface UserTaskItem {
    id_task: string
    title: string
    description: string | null
    task_number: number
    progress: number
    priority: TaskPriority
    status: TaskStatus
    start_date: Date
    end_date: Date | null
    project: { id_project: string; name: string } | null
    isOverdue: boolean
}

export interface UserTasksResponse {
    total: number
    tasks: UserTaskItem[]
}

const isTaskStatus = (value: string): value is TaskStatus =>
    Object.values(TaskStatus).includes(value as TaskStatus)

const isTaskPriority = (value: string): value is TaskPriority =>
    Object.values(TaskPriority).includes(value as TaskPriority)

const isOverdue = (task: Task, today: Date): boolean =>
    task.end_date !== null
    && task.end_date.getTime() < today.getTime()
    && task.status !== TaskStatus.COMPLETED

export const getUserTasksUseCase = async (
    userId: string,
    rawFilters: { status?: string; priority?: string } = {}
): Promise<UserTasksResponse> => {
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

    const today = new Date()
    const rows = await getTasksByAssignedUserWithProject(userId, filters)

    const tasks: UserTaskItem[] = rows.map((task) => ({
        id_task: task.id_task,
        title: task.title,
        description: task.description,
        task_number: task.task_number,
        progress: task.progress,
        priority: task.priority,
        status: task.status,
        start_date: task.start_date,
        end_date: task.end_date,
        project: task.project,
        isOverdue: isOverdue(task, today)
    }))

    return {
        total: tasks.length,
        tasks
    }
}
