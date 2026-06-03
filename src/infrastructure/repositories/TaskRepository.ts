import { In } from "typeorm"
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

// Variante en lote: trae en UNA sola query las tareas de varios proyectos
// (evita el N+1 de llamar getTasksByProject por cada proyecto en los dashboards).
// Mismo orden (createdAt DESC) para que el agrupado en memoria sea equivalente.
export const getTasksByProjects = async (projectIds: string[]): Promise<Task[]> => {
    if (projectIds.length === 0) return []
    return await repo.find({ where: { id_project: In(projectIds) }, order: { createdAt: "DESC" } })
}

export const getNextTaskNumberForProject = async (projectId: string): Promise<number> => {
    const result = await repo.createQueryBuilder("task")
        .select("MAX(task.task_number)", "max")
        .where("task.id_project = :projectId", { projectId })
        .getRawOne<{ max: number | null }>()

    return (result?.max ?? 0) + 1
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

export const getCompletedTasksInRange = async (
    projectIds: string[],
    rangeStart: Date,
    rangeEnd: Date
): Promise<Task[]> => {
    if (projectIds.length === 0) return []

    return await repo.createQueryBuilder("task")
        .where("task.id_project IN (:...projectIds)", { projectIds })
        .andWhere("task.status = :status", { status: TaskStatus.COMPLETED })
        .andWhere("task.completedAt IS NOT NULL")
        .andWhere("task.completedAt >= :rangeStart", { rangeStart })
        .andWhere("task.completedAt < :rangeEnd", { rangeEnd })
        .orderBy("task.completedAt", "ASC")
        .getMany()
}

export const deleteTask = async (id: string): Promise<boolean> => {
    const result = await repo.delete({ id_task: id })
    return (result.affected ?? 0) > 0
}

export interface UserCompletedStats {
    userId: string
    completedStoryPoints: number
    completedTaskCount: number
}

// Agrega, por usuario asignado, los story_points y el numero de tareas COMPLETADAS
// (story_points null cuenta como 0). Usado por el leaderboard y el recomendador.
export const getCompletedStatsByUser = async (): Promise<UserCompletedStats[]> => {
    const rows = await repo.createQueryBuilder("task")
        .select("task.assignedTo", "userId")
        .addSelect(`COALESCE(SUM(task."story_points"), 0)`, "completedStoryPoints")
        .addSelect("COUNT(*)", "completedTaskCount")
        .where("task.status = :status", { status: TaskStatus.COMPLETED })
        .andWhere("task.assignedTo IS NOT NULL")
        .groupBy("task.assignedTo")
        .getRawMany()

    return rows.map((r) => ({
        userId: r.userId,
        completedStoryPoints: Number(r.completedStoryPoints) || 0,
        completedTaskCount: Number(r.completedTaskCount) || 0
    }))
}
