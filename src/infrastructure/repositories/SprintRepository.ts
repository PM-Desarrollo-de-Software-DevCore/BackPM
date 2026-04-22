import { AppDataSource } from "../db/DataSource"
import { SprintEntity } from "../db/entities/SprintEntity"
import { Sprint } from "../../entities/Sprint"

// Este archivo va a tener métodos como:
// - createSprint(data)
// - getSprintById(id)
// - getSprintsByProject(projectId)
// - updateSprint(id, data)
// - deleteSprint(id)

// Hacer un select de la tabla user
const repo = AppDataSource.getRepository(SprintEntity)

export const createSprint = async (data: Omit<Sprint, "id_sprint" | "createdAt">): Promise<Sprint> => {
    const sprint = repo.create(data)
    return await repo.save(sprint)
}

export const getSprintById = async (id: string): Promise<Sprint | null> => {
    return await repo.findOne({ where: { id_sprint: id } })
}

export const getSprintByProject = async (projectId: string): Promise<Sprint | null> => {
    return await repo.findOne({ where: { id_project: projectId } })
}

export const updateSprint = async (id: string, data: Partial<Omit<Sprint, "id_sprint" | "createdAt">>): Promise<void> => {
    await repo.update({ id_sprint: id }, data)
}

export const deleteSprint = async (id: string): Promise<void> => {
    await repo.delete({ id_sprint: id })
}

