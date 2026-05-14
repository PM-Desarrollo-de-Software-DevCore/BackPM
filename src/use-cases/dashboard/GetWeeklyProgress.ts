import { getProjectsByUser, getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { getCompletedTasksInRange } from "../../infrastructure/repositories/TaskRepository"

const MS_PER_DAY = 1000 * 60 * 60 * 24
const DAYS_PER_WEEK = 7
const DAY_LABELS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const

type DayLabel = typeof DAY_LABELS[number]

export interface WeeklyProgressDay {
    date: string
    dayOfWeek: DayLabel
    completed: number
}

export interface WeeklyProgressResponse {
    weekRange: {
        start: Date
        end: Date
        weekOffset: number
    }
    totalCompleted: number
    dailyCompletions: WeeklyProgressDay[]
}

const startOfWeekMonday = (date: Date): Date => {
    const result = new Date(date)
    result.setHours(0, 0, 0, 0)
    const day = result.getDay()
    const diff = day === 0 ? -6 : 1 - day
    result.setDate(result.getDate() + diff)
    return result
}

const formatLocalDate = (date: Date): string => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
}

const dayIndexFromMonday = (date: Date): number => {
    const day = date.getDay()
    return day === 0 ? 6 : day - 1
}

const parseWeekOffset = (raw: string | undefined): number => {
    if (raw === undefined) return 0
    const parsed = Number(raw)
    if (!Number.isInteger(parsed)) {
        throw new Error("weekOffset debe ser un entero")
    }
    if (parsed > 0) {
        throw new Error("weekOffset no puede ser positivo (la semana en curso es 0)")
    }
    if (parsed < -520) {
        throw new Error("weekOffset fuera de rango")
    }
    return parsed
}

export const getWeeklyProgressUseCase = async (
    userId: string,
    rawFilters: { weekOffset?: string; projectId?: string } = {}
): Promise<WeeklyProgressResponse> => {
    const weekOffset = parseWeekOffset(rawFilters.weekOffset)

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

    const today = new Date()
    const weekStart = startOfWeekMonday(today)
    weekStart.setDate(weekStart.getDate() + weekOffset * DAYS_PER_WEEK)

    const weekEndExclusive = new Date(weekStart)
    weekEndExclusive.setDate(weekEndExclusive.getDate() + DAYS_PER_WEEK)

    const completedTasks = await getCompletedTasksInRange(projectIds, weekStart, weekEndExclusive)

    const buckets: number[] = new Array(DAYS_PER_WEEK).fill(0)
    for (const task of completedTasks) {
        if (task.completedAt === null) continue
        const idx = dayIndexFromMonday(task.completedAt)
        buckets[idx] = (buckets[idx] ?? 0) + 1
    }

    const dailyCompletions: WeeklyProgressDay[] = DAY_LABELS.map((dayOfWeek, i) => {
        const date = new Date(weekStart)
        date.setDate(date.getDate() + i)
        return {
            date: formatLocalDate(date),
            dayOfWeek,
            completed: buckets[i] ?? 0
        }
    })

    const weekEndInclusive = new Date(weekEndExclusive)
    weekEndInclusive.setMilliseconds(weekEndInclusive.getMilliseconds() - 1)

    return {
        weekRange: {
            start: weekStart,
            end: weekEndInclusive,
            weekOffset
        },
        totalCompleted: completedTasks.length,
        dailyCompletions
    }
}
