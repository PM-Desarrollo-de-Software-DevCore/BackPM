import { getCompletedTasksByUsersInRange } from "../../infrastructure/repositories/TaskRepository"

export interface CompletedTodayCount {
    userId: string
    count: number
}

/**
 * Conteo de tareas completadas HOY por cada usuario (de los userIds dados).
 * Usado por el badge del leaderboard. Una sola query (assignedTo IN ...) + conteo
 * en memoria, en vez de un request por usuario.
 *
 * "Hoy" se calcula en hora local del servidor (consistente con weekly-progress).
 */
export const getCompletedTodayCountsUseCase = async (
    userIds: string[]
): Promise<CompletedTodayCount[]> => {
    if (!Array.isArray(userIds) || userIds.length === 0) {
        return []
    }

    const dayStart = new Date()
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const tasks = await getCompletedTasksByUsersInRange(userIds, dayStart, dayEnd)

    const counts = new Map<string, number>()
    for (const userId of userIds) counts.set(userId, 0)
    for (const task of tasks) {
        if (task.assignedTo && counts.has(task.assignedTo)) {
            counts.set(task.assignedTo, (counts.get(task.assignedTo) ?? 0) + 1)
        }
    }

    return [...counts.entries()].map(([userId, count]) => ({ userId, count }))
}
