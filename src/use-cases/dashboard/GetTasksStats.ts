import { getProjectsByUser } from "../../infrastructure/repositories/ProjectRepository"
import { getTasksByProject } from "../../infrastructure/repositories/TaskRepository"
import { Project } from "../../entities/Project"
import { Task, TaskPriority, TaskStatus } from "../../entities/Task"

export interface TasksStatsSummary {
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    pendingTasks: number
    overdueTasks: number
    unassignedTasks: number
    completionPercentage: number
    highPriorityTasks: number
    mediumPriorityTasks: number
    lowPriorityTasks: number
}

export interface TasksByProjectItem {
    id_project: string
    name: string
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    pendingTasks: number
    overdueTasks: number
    completionPercentage: number
}

export interface MyTasksBreakdown {
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    pendingTasks: number
    overdueTasks: number
}

export interface TasksStatsResponse {
    summary: TasksStatsSummary
    tasksByStatus: { status: TaskStatus; count: number }[]
    tasksByPriority: { priority: TaskPriority; count: number }[]
    tasksByProject: TasksByProjectItem[]
    myTasks: MyTasksBreakdown
}

const isOverdue = (task: Task, today: Date): boolean =>
    task.end_date !== null
    && task.end_date.getTime() < today.getTime()
    && task.status !== TaskStatus.COMPLETED

const buildProjectBreakdown = (project: Project, tasks: Task[], today: Date): TasksByProjectItem => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length
    const inProgressTasks = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length
    const pendingTasks = tasks.filter((t) => t.status === TaskStatus.PENDING).length
    const overdueTasks = tasks.filter((t) => isOverdue(t, today)).length

    const completionPercentage = totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100)

    return {
        id_project: project.id_project,
        name: project.name,
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        overdueTasks,
        completionPercentage
    }
}

const buildMyTasks = (tasks: Task[], userId: string, today: Date): MyTasksBreakdown => {
    const mine = tasks.filter((t) => t.assignedTo === userId)
    return {
        totalTasks: mine.length,
        completedTasks: mine.filter((t) => t.status === TaskStatus.COMPLETED).length,
        inProgressTasks: mine.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
        pendingTasks: mine.filter((t) => t.status === TaskStatus.PENDING).length,
        overdueTasks: mine.filter((t) => isOverdue(t, today)).length
    }
}

export const getTasksStatsUseCase = async (userId: string): Promise<TasksStatsResponse> => {
    const projects = await getProjectsByUser(userId)
    const today = new Date()

    const projectsWithTasks = await Promise.all(
        projects.map(async (project) => ({
            project,
            tasks: await getTasksByProject(project.id_project)
        }))
    )

    const allTasks: Task[] = projectsWithTasks.flatMap(({ tasks }) => tasks)

    const completedTasks = allTasks.filter((t) => t.status === TaskStatus.COMPLETED).length
    const inProgressTasks = allTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length
    const pendingTasks = allTasks.filter((t) => t.status === TaskStatus.PENDING).length
    const overdueTasks = allTasks.filter((t) => isOverdue(t, today)).length
    const unassignedTasks = allTasks.filter((t) => t.assignedTo === null).length

    const summary: TasksStatsSummary = {
        totalTasks: allTasks.length,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        overdueTasks,
        unassignedTasks,
        completionPercentage: allTasks.length === 0
            ? 0
            : Math.round((completedTasks / allTasks.length) * 100),
        highPriorityTasks: allTasks.filter((t) => t.priority === TaskPriority.HIGH).length,
        mediumPriorityTasks: allTasks.filter((t) => t.priority === TaskPriority.MEDIUM).length,
        lowPriorityTasks: allTasks.filter((t) => t.priority === TaskPriority.LOW).length
    }

    const tasksByStatus = [
        { status: TaskStatus.PENDING, count: pendingTasks },
        { status: TaskStatus.IN_PROGRESS, count: inProgressTasks },
        { status: TaskStatus.COMPLETED, count: completedTasks }
    ]

    const tasksByPriority = [
        { priority: TaskPriority.HIGH, count: summary.highPriorityTasks },
        { priority: TaskPriority.MEDIUM, count: summary.mediumPriorityTasks },
        { priority: TaskPriority.LOW, count: summary.lowPriorityTasks }
    ]

    const tasksByProject = projectsWithTasks.map(({ project, tasks }) =>
        buildProjectBreakdown(project, tasks, today)
    )

    const myTasks = buildMyTasks(allTasks, userId, today)

    return {
        summary,
        tasksByStatus,
        tasksByPriority,
        tasksByProject,
        myTasks
    }
}
