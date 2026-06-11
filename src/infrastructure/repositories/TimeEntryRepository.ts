import { Between } from "typeorm"
import { AppDataSource } from "../db/DataSource"
import { TimeEntryEntity } from "../db/entities/TimeEntryEntity"
import { TimeEntry } from "../../entities/TimeEntry"

const repo = AppDataSource.getRepository(TimeEntryEntity)

export const createTimeEntry = async (data: Omit<TimeEntry, "id_time_entry" | "createdAt">): Promise<TimeEntry> => {
    const entry = repo.create(data)
    return await repo.save(entry)
}

export const getTimeEntryById = async (id: string): Promise<TimeEntry | null> => {
    return await repo.findOne({ where: { id_time_entry: id } })
}

export const getTimeEntriesByTask = async (taskId: string) => {
    return await repo.find({
        where: { id_task: taskId },
        relations: ["user"],
        order: { work_date: "DESC" }
    })
}

export const getTimeEntriesByProject = async (projectId: string): Promise<TimeEntry[]> => {
    return await repo.find({ where: { id_project: projectId }, order: { work_date: "ASC" } })
}

// Horas registradas de un proyecto dentro de un rango de fechas (inclusive en ambos
// extremos). Base del auto-calculo de facturas T&M.
export const getTimeEntriesByProjectAndPeriod = async (
    projectId: string,
    start: Date,
    end: Date
): Promise<TimeEntry[]> => {
    return await repo.find({
        where: { id_project: projectId, work_date: Between(start, end) },
        order: { work_date: "ASC" }
    })
}

export const updateTimeEntry = async (
    id: string,
    data: Partial<Pick<TimeEntry, "hours" | "work_date" | "description">>
): Promise<TimeEntry | null> => {
    await repo.update({ id_time_entry: id }, data)
    return await getTimeEntryById(id)
}

export const deleteTimeEntry = async (id: string): Promise<boolean> => {
    const result = await repo.delete({ id_time_entry: id })
    return (result.affected ?? 0) > 0
}
