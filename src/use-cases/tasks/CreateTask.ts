import { createTask, getNextTaskNumberForProject } from "../../infrastructure/repositories/TaskRepository"
import { getUserRoleInProject, isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { getSprintById } from "../../infrastructure/repositories/SprintRepository"
import { Task, TaskPriority, TaskStatus } from "../../entities/Task"
import { ProjectRole } from "../../entities/MemberProject"
import { notifyTaskAssigned } from "../../infrastructure/services/notificationService"

export const createTaskUseCase = async (
    data: {
        title: string
        description?: string | null
        progress: number
        story_points?: number | null
        priority: TaskPriority
        status: TaskStatus
        end_date: Date | null
        id_sprint: string | null
        assignedTo?: string | null
    },
    id_project: string,
    userId: string
): Promise<Task> => {
    const project = await getProjectById(id_project)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    let userRole = await getUserRoleInProject(userId, id_project)
    if (!userRole) {
        if (project.createdBy === userId) {
            userRole = ProjectRole.PROJECT_MANAGER
        } else {
            throw new Error("No tienes permisos en este proyecto")
        }
    }

    if (userRole !== ProjectRole.PROJECT_MANAGER && userRole !== ProjectRole.SCRUM_MASTER) {
        throw new Error("Solo project_manager y scrum_master pueden crear tareas")
    }

    if (!data.title || data.title.trim().length === 0) {
        throw new Error("El título es obligatorio")
    }

    if (data.progress === undefined || data.progress === null) {
        throw new Error("El progreso es obligatorio")
    }
    if (!Number.isFinite(data.progress) || data.progress < 0 || data.progress > 100) {
        throw new Error("El progreso debe estar entre 0 y 100")
    }

    if (data.story_points !== undefined && data.story_points !== null) {
        if (!Number.isInteger(data.story_points) || data.story_points < 0) {
            throw new Error("Los story points deben ser un entero mayor o igual a 0")
        }
    }

    if (data.id_sprint) {
        const sprint = await getSprintById(data.id_sprint)
        if (!sprint) {
            throw new Error("Sprint no encontrado")
        }
        if (sprint.id_project !== id_project) {
            throw new Error("El sprint no pertenece al proyecto")
        }
    }

    const assignedTo = data.assignedTo ?? null
    if (assignedTo) {
        const isMember = await isMemberProject(assignedTo, id_project)
        if (!isMember && project.createdBy !== assignedTo) {
            throw new Error("El usuario asignado no es miembro del proyecto")
        }
    }

    const task_number = await getNextTaskNumberForProject(id_project)

    const task = await createTask({
        title: data.title,
        description: data.description ?? null,
        task_number,
        progress: data.progress,
        story_points: data.story_points ?? null,
        priority: data.priority,
        status: data.status,
        end_date: data.end_date,
        id_project,
        id_sprint: data.id_sprint,
        createdBy: userId,
        assignedTo,
        completedAt: data.status === TaskStatus.COMPLETED ? new Date() : null
    })

    await notifyTaskAssigned(task.id_task, task.assignedTo, userId)

    return task
}
