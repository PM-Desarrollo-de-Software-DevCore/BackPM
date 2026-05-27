import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { getTasksByProject } from "../../infrastructure/repositories/TaskRepository"
import { Task, TaskStatus } from "../../entities/Task"

export interface ProjectStoryPointsResponse {
    totalPoints: number
    completedPoints: number
    inProgressPoints: number
    pendingPoints: number
    totalTasks: number
    estimatedTasks: number
    unestimatedTasks: number
    pointsByStatus: { status: TaskStatus; points: number }[]
}

// Las tareas sin estimar (story_points = null) cuentan como 0 puntos.
const pointsOf = (task: Task): number => task.story_points ?? 0

export const getProjectStoryPointsUseCase = async (
    projectId: string,
    userId: string
): Promise<ProjectStoryPointsResponse> => {
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    const isMember = await isMemberProject(userId, projectId)
    if (!isMember && project.createdBy !== userId) {
        throw new Error("No tienes acceso a este proyecto")
    }

    const tasks = await getTasksByProject(projectId)

    const completedPoints = tasks
        .filter((t) => t.status === TaskStatus.COMPLETED)
        .reduce((acc, t) => acc + pointsOf(t), 0)
    const inProgressPoints = tasks
        .filter((t) => t.status === TaskStatus.IN_PROGRESS)
        .reduce((acc, t) => acc + pointsOf(t), 0)
    const pendingPoints = tasks
        .filter((t) => t.status === TaskStatus.PENDING)
        .reduce((acc, t) => acc + pointsOf(t), 0)

    return {
        totalPoints: completedPoints + inProgressPoints + pendingPoints,
        completedPoints,
        inProgressPoints,
        pendingPoints,
        totalTasks: tasks.length,
        estimatedTasks: tasks.filter((t) => t.story_points !== null).length,
        unestimatedTasks: tasks.filter((t) => t.story_points === null).length,
        pointsByStatus: [
            { status: TaskStatus.PENDING, points: pendingPoints },
            { status: TaskStatus.IN_PROGRESS, points: inProgressPoints },
            { status: TaskStatus.COMPLETED, points: completedPoints }
        ]
    }
}
