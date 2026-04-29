import { AppDataSource } from "../db/DataSource"
import { SprintEntity } from "../db/entities/SprintEntity"
import { Sprint } from "../../entities/Sprint"

const repo = AppDataSource.getRepository(SprintEntity)

export const createSprint = async (data: Omit<Sprint, "id_sprint" | "createdAt">): Promise<Sprint> => {
    const sprint = repo.create(data)
    return await repo.save(sprint)
}

export const getSprintById = async (id: string): Promise<Sprint | null> => {
    return await repo.findOne({ where: { id_sprint: id } })
}

export const getSprintsByProject = async (projectId: string): Promise<Sprint[]> => {
    return await repo.find({ where: { id_project: projectId }, order: { createdAt: "DESC" } })
}

export const updateSprint = async (id: string, data: Partial<Omit<Sprint, "id_sprint" | "createdAt">>): Promise<Sprint | null> => {
    await repo.update({ id_sprint: id }, data)
    return await getSprintById(id)
}

export const deleteSprint = async (id: string): Promise<boolean> => {
    const result = await repo.delete({ id_sprint: id })
    return (result.affected ?? 0) > 0
}