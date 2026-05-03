import { AppDataSource } from "../db/DataSource"
import { TaskEntity } from "../db/entities/TaskEntity"
import { Task, TaskPriority, TaskStatus } from "../../entities/Task"

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

export interface AssignedTaskFilters {
    status?: TaskStatus
    priority?: TaskPriority
}

export const getTasksByAssignedUser = async (
    userId: string,
    filters: AssignedTaskFilters = {}
): Promise<Task[]> => {
    const qb = repo.createQueryBuilder("task")
        .where("task.assignedTo = :userId", { userId })

    if (filters.status) {
        qb.andWhere("task.status = :status", { status: filters.status })
    }
    if (filters.priority) {
        qb.andWhere("task.priority = :priority", { priority: filters.priority })
    }

    return await qb.orderBy("task.createdAt", "DESC").getMany()
}

export interface TaskWithProject extends Task {
    project: { id_project: string; name: string } | null
}

export const getTasksByAssignedUserWithProject = async (
    userId: string,
    filters: AssignedTaskFilters = {}
): Promise<TaskWithProject[]> => {
    const qb = repo.createQueryBuilder("task")
        .leftJoinAndSelect("task.project", "project")
        .where("task.assignedTo = :userId", { userId })

    if (filters.status) {
        qb.andWhere("task.status = :status", { status: filters.status })
    }
    if (filters.priority) {
        qb.andWhere("task.priority = :priority", { priority: filters.priority })
    }

    const rows = await qb.orderBy("task.createdAt", "DESC").getMany()

    return rows.map((row: any) => ({
        ...row,
        project: row.project
            ? { id_project: row.project.id_project, name: row.project.name }
            : null
    }))
}

export const updateTask = async (id: string, data: Partial<Omit<Task, "id_task" | "createdAt">>): Promise<Task | null> => {
    await repo.update({ id_task: id }, data)
    return await getTaskById(id)
}

export const deleteTask = async (id: string): Promise<boolean> => {
    const result = await repo.delete({ id_task: id })
    return (result.affected ?? 0) > 0
}
