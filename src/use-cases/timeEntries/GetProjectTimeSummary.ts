import { getTimeEntriesByProject } from "../../infrastructure/repositories/TimeEntryRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"

export interface TimeSummaryGroup {
    id: string // id_user o id_task segun el grupo
    hours: number
    entries: number
}

export interface ProjectTimeSummaryResponse {
    totalHours: number
    entryCount: number
    byUser: TimeSummaryGroup[]
    byTask: TimeSummaryGroup[]
}

const round2 = (value: number): number => Math.round(value * 100) / 100

export const getProjectTimeSummaryUseCase = async (
    projectId: string,
    userId: string
): Promise<ProjectTimeSummaryResponse> => {
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    const isMember = await isMemberProject(userId, projectId)
    if (!isMember && project.createdBy !== userId) {
        throw new Error("No tienes acceso a este proyecto")
    }

    const entries = await getTimeEntriesByProject(projectId)

    const userMap = new Map<string, { hours: number; entries: number }>()
    const taskMap = new Map<string, { hours: number; entries: number }>()
    let totalHours = 0

    for (const e of entries) {
        totalHours += e.hours

        const u = userMap.get(e.id_user) ?? { hours: 0, entries: 0 }
        u.hours += e.hours
        u.entries += 1
        userMap.set(e.id_user, u)

        const t = taskMap.get(e.id_task) ?? { hours: 0, entries: 0 }
        t.hours += e.hours
        t.entries += 1
        taskMap.set(e.id_task, t)
    }

    const toGroups = (map: Map<string, { hours: number; entries: number }>): TimeSummaryGroup[] =>
        Array.from(map.entries()).map(([id, v]) => ({ id, hours: round2(v.hours), entries: v.entries }))

    return {
        totalHours: round2(totalHours),
        entryCount: entries.length,
        byUser: toGroups(userMap),
        byTask: toGroups(taskMap)
    }
}
