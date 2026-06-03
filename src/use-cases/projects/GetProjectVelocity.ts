import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { getSprintsByProject } from "../../infrastructure/repositories/SprintRepository"
import { getTasksBySprints } from "../../infrastructure/repositories/TaskRepository"
import { Task, TaskStatus } from "../../entities/Task"
import { SprintStatus } from "../../entities/Sprint"

export interface SprintVelocityItem {
    id_sprint: string
    name: string
    status: SprintStatus
    start_date: Date
    end_date: Date
    committedPoints: number
    completedPoints: number
}

export interface ProjectVelocityResponse {
    sprints: SprintVelocityItem[]
    averageVelocity: number
    finishedSprintsCount: number
}

// Las tareas sin estimar (story_points = null) cuentan como 0 puntos.
const pointsOf = (task: Task): number => task.story_points ?? 0

export const getProjectVelocityUseCase = async (
    projectId: string,
    userId: string
): Promise<ProjectVelocityResponse> => {
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    const isMember = await isMemberProject(userId, projectId)
    if (!isMember && project.createdBy !== userId) {
        throw new Error("No tienes acceso a este proyecto")
    }

    const sprints = await getSprintsByProject(projectId)

    // Una sola query para las tareas de TODOS los sprints (antes: 1 query por sprint => N+1).
    const allTasks = await getTasksBySprints(sprints.map((sprint) => sprint.id_sprint))
    const tasksBySprint = new Map<string, Task[]>()
    for (const task of allTasks) {
        if (!task.id_sprint) continue
        const list = tasksBySprint.get(task.id_sprint)
        if (list) list.push(task)
        else tasksBySprint.set(task.id_sprint, [task])
    }

    const items: SprintVelocityItem[] = sprints.map((sprint) => {
        const tasks = tasksBySprint.get(sprint.id_sprint) ?? []
        const completedPoints = tasks
            .filter((t) => t.status === TaskStatus.COMPLETED)
            .reduce((acc, t) => acc + pointsOf(t), 0)
        const committedPoints = tasks.reduce((acc, t) => acc + pointsOf(t), 0)

        return {
            id_sprint: sprint.id_sprint,
            name: sprint.name,
            status: sprint.status,
            start_date: sprint.start_date,
            end_date: sprint.end_date,
            committedPoints,
            completedPoints
        }
    })

    // Orden cronologico para la grafica de velocity
    items.sort((a, b) => a.start_date.getTime() - b.start_date.getTime())

    // La velocity se mide sobre lo realmente entregado en sprints finalizados.
    const finished = items.filter((i) => i.status === SprintStatus.FINISHED)
    const averageVelocity = finished.length === 0
        ? 0
        : Math.round(finished.reduce((acc, i) => acc + i.completedPoints, 0) / finished.length)

    return {
        sprints: items,
        averageVelocity,
        finishedSprintsCount: finished.length
    }
}
