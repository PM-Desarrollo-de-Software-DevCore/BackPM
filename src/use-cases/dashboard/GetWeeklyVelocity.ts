import { getProjectsByUser, getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { getCompletedTasksInRange } from "../../infrastructure/repositories/TaskRepository"

const DAYS_PER_WEEK = 7
const DEFAULT_WEEKS = 5
const MAX_WEEKS = 52

export interface WeeklyVelocityPoint {
    weekStart: Date
    totalCompleted: number
}

export interface WeeklyVelocityResponse {
    series: WeeklyVelocityPoint[]
}

const startOfWeekMonday = (date: Date): Date => {
    const result = new Date(date)
    result.setHours(0, 0, 0, 0)
    const day = result.getDay()
    const diff = day === 0 ? -6 : 1 - day
    result.setDate(result.getDate() + diff)
    return result
}

const parseWeeks = (raw: string | undefined): number => {
    if (raw === undefined) return DEFAULT_WEEKS
    const parsed = Number(raw)
    if (!Number.isInteger(parsed) || parsed < 1) {
        throw new Error("weeks debe ser un entero positivo")
    }
    return Math.min(parsed, MAX_WEEKS)
}

/**
 * Serie de velocidad semanal (tareas completadas por semana) en UNA sola respuesta.
 * Reemplaza el 1+N del frontend (getWeeklyVelocitySeries hacía N llamadas a
 * /dashboard/weekly-progress, una por semana). Aquí se hace UNA query sobre el rango
 * completo (semana más antigua -> semana en curso) y se agrupa por semana en memoria.
 */
export const getWeeklyVelocityUseCase = async (
    userId: string,
    rawFilters: { projectId?: string; weeks?: string } = {}
): Promise<WeeklyVelocityResponse> => {
    const weeks = parseWeeks(rawFilters.weeks)

    let projectIds: string[]
    if (rawFilters.projectId !== undefined) {
        const project = await getProjectById(rawFilters.projectId)
        if (!project) {
            throw new Error("Proyecto no encontrado")
        }
        const isMember = await isMemberProject(userId, project.id_project)
        if (!isMember && project.createdBy !== userId) {
            throw new Error("No tienes acceso a este proyecto")
        }
        projectIds = [project.id_project]
    } else {
        const projects = await getProjectsByUser(userId)
        projectIds = projects.map((p) => p.id_project)
    }

    return computeWeeklyVelocity(projectIds, weeks)
}

// Cómputo puro de la serie de velocidad (SIN validación de acceso): asume projectIds
// ya autorizados. Lo reutiliza el endpoint agregado de worklogs para no re-validar.
export const computeWeeklyVelocity = async (
    projectIds: string[],
    weeks: number
): Promise<WeeklyVelocityResponse> => {
    const currentWeekStart = startOfWeekMonday(new Date())
    const oldestStart = new Date(currentWeekStart)
    oldestStart.setDate(oldestStart.getDate() - (weeks - 1) * DAYS_PER_WEEK)
    const rangeEndExclusive = new Date(currentWeekStart)
    rangeEndExclusive.setDate(rangeEndExclusive.getDate() + DAYS_PER_WEEK)

    const completedTasks = await getCompletedTasksInRange(projectIds, oldestStart, rangeEndExclusive)

    const series: WeeklyVelocityPoint[] = []
    for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(oldestStart)
        weekStart.setDate(weekStart.getDate() + i * DAYS_PER_WEEK)
        const weekEndExclusive = new Date(weekStart)
        weekEndExclusive.setDate(weekEndExclusive.getDate() + DAYS_PER_WEEK)

        let totalCompleted = 0
        for (const task of completedTasks) {
            if (task.completedAt === null) continue
            if (task.completedAt >= weekStart && task.completedAt < weekEndExclusive) {
                totalCompleted += 1
            }
        }

        series.push({ weekStart, totalCompleted })
    }

    return { series }
}
