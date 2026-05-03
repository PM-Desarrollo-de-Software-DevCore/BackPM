import { AppDataSource } from "../db/DataSource"
import { TaskEntity } from "../db/entities/TaskEntity"
import { Task } from "../../entities/Task"

const repo = AppDataSource.getRepository(TaskEntity)

export const createTask = async (data: Omit<Task, "id_task" | "createdAt">): Promise<Task> => {
    const task = repo.create(data)
    return await repo.save(task)
}

export const getTaskById = async (id: string): Promise<Task | null> => {
    return await repo.findOne({ where: { id_task: id } })
}

export const getTasksByProject = async (projectId: string): Promise<Task[]> => {
    return await repo.find({ where: { id_project: projectId }, order: { createdAt: "DESC" } })
}

export const getTasksBySprint = async (sprintId: string): Promise<Task[]> => {
    return await repo.find({ where: { id_sprint: sprintId }, order: { createdAt: "DESC" } })
}

export const updateTask = async (id: string, data: Partial<Omit<Task, "id_task" | "createdAt">>): Promise<Task | null> => {
    await repo.update({ id_task: id }, data)
    return await getTaskById(id)
}

export const deleteTask = async (id: string): Promise<boolean> => {
    const result = await repo.delete({ id_task: id })
    return (result.affected ?? 0) > 0
}
