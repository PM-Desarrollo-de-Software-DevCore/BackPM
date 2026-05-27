import { getSprintById } from "../../infrastructure/repositories/SprintRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { getTasksBySprint } from "../../infrastructure/repositories/TaskRepository"
import { Task, TaskStatus } from "../../entities/Task"

export interface SprintStoryPointsSummary {
    id_sprint: string
    committedPoints: number
    completedPoints: number
    remainingPoints: number
    inProgressPoints: number
    pendingPoints: number
    totalTasks: number
    estimatedTasks: number
    unestimatedTasks: number
}

// Las tareas sin estimar (story_points = null) cuentan como 0 puntos.
const pointsOf = (task: Task): number => task.story_points ?? 0

export const getSprintStoryPointsUseCase = async (
    sprintId: string,
    userId: string
): Promise<SprintStoryPointsSummary> => {
    const sprint = await getSprintById(sprintId)
    if (!sprint) {
        throw new Error("Sprint no encontrado")
    }

    const project = await getProjectById(sprint.id_project)
    if (!project) {
        throw new Error("Proyecto del sprint no encontrado")
    }

    const isMember = await isMemberProject(userId, sprint.id_project)
    if (!isMember && project.createdBy !== userId) {
        throw new Error("No tienes acceso a este sprint")
    }

    const tasks = await getTasksBySprint(sprintId)

    const completedPoints = tasks
        .filter((t) => t.status === TaskStatus.COMPLETED)
        .reduce((acc, t) => acc + pointsOf(t), 0)
    const inProgressPoints = tasks
        .filter((t) => t.status === TaskStatus.IN_PROGRESS)
        .reduce((acc, t) => acc + pointsOf(t), 0)
    const pendingPoints = tasks
        .filter((t) => t.status === TaskStatus.PENDING)
        .reduce((acc, t) => acc + pointsOf(t), 0)
    const committedPoints = completedPoints + inProgressPoints + pendingPoints

    return {
        id_sprint: sprintId,
        committedPoints,
        completedPoints,
        remainingPoints: committedPoints - completedPoints,
        inProgressPoints,
        pendingPoints,
        totalTasks: tasks.length,
        estimatedTasks: tasks.filter((t) => t.story_points !== null).length,
        unestimatedTasks: tasks.filter((t) => t.story_points === null).length
    }
}
