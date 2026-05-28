import { AppDataSource } from "../db/DataSource"
import { ProgressEntryEntity } from "../db/entities/ProgressEntryEntity"
import { ProgressEntry, ProgressEntryType } from "../../entities/ProgressEntry"

const repo = AppDataSource.getRepository(ProgressEntryEntity)

export const createProgressEntry = async (data: Omit<ProgressEntry, "id_entry" | "createdAt">): Promise<ProgressEntry> => {
    const entry = repo.create(data)
    return await repo.save(entry)
}

export const getProgressEntryById = async (id: string): Promise<ProgressEntry | null> => {
    return await repo.findOne({ where: { id_entry: id } })
}

export interface ProgressEntryFilters {
    type?: ProgressEntryType
    sprintId?: string
}

// Lista historica del proyecto (mas reciente primero), con filtros opcionales por tipo y sprint
export const getProgressEntriesByProject = async (
    projectId: string,
    filters: ProgressEntryFilters = {}
): Promise<ProgressEntry[]> => {
    const qb = repo.createQueryBuilder("e").where("e.id_project = :projectId", { projectId })

    if (filters.type) {
        qb.andWhere("e.type = :type", { type: filters.type })
    }
    if (filters.sprintId) {
        qb.andWhere("e.id_sprint = :sprintId", { sprintId: filters.sprintId })
    }

    return await qb.orderBy("e.date", "DESC").addOrderBy("e.createdAt", "DESC").getMany()
}

export const deleteProgressEntry = async (id: string): Promise<boolean> => {
    const result = await repo.delete({ id_entry: id })
    return (result.affected ?? 0) > 0
}
