import { AppDataSource } from "../db/DataSource"
import { MilestoneEntity } from "../db/entities/MilestoneEntity"
import { Milestone } from "../../entities/Milestone"

const repo = AppDataSource.getRepository(MilestoneEntity)

export const createMilestone = async (data: Omit<Milestone, "id_milestone" | "createdAt">): Promise<Milestone> => {
    const milestone = repo.create(data)
    return await repo.save(milestone)
}

export const getMilestoneById = async (id: string): Promise<Milestone | null> => {
    return await repo.findOne({ where: { id_milestone: id } })
}

export const getMilestonesByProject = async (projectId: string): Promise<Milestone[]> => {
    return await repo.find({ where: { id_project: projectId }, order: { due_date: "ASC" } })
}

export const updateMilestone = async (id: string, data: Partial<Omit<Milestone, "id_milestone" | "createdAt">>): Promise<Milestone | null> => {
    await repo.update({ id_milestone: id }, data)
    return await getMilestoneById(id)
}

export const deleteMilestone = async (id: string): Promise<boolean> => {
    const result = await repo.delete({ id_milestone: id })
    return (result.affected ?? 0) > 0
}

export const countMilestonesByProject = async (projectId: string): Promise<number> => {
    return await repo.count({ where: { id_project: projectId } })
}

// Un hito esta retrasado si su due_date ya paso y no esta completado (completedAt IS NULL)
export const countOverdueMilestonesByProject = async (projectId: string, now: Date): Promise<number> => {
    return await repo.createQueryBuilder("m")
        .where("m.id_project = :projectId", { projectId })
        .andWhere("m.due_date < :now", { now })
        .andWhere("m.completedAt IS NULL")
        .getCount()
}

export const countOverdueMilestonesByProjects = async (projectIds: string[], now: Date): Promise<number> => {
    if (projectIds.length === 0) return 0
    return await repo.createQueryBuilder("m")
        .where("m.id_project IN (:...projectIds)", { projectIds })
        .andWhere("m.due_date < :now", { now })
        .andWhere("m.completedAt IS NULL")
        .getCount()
}
