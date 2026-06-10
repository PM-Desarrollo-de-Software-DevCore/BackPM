import { getTaskById, updateTask } from "../../infrastructure/repositories/TaskRepository"
import { getUserRoleInProject, isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { getSprintById } from "../../infrastructure/repositories/SprintRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { TaskPriority, TaskStatus } from "../../entities/Task"
import { ProjectRole } from "../../entities/MemberProject"
import { notifyTaskAssigned, notifyTaskCompleted } from "../../infrastructure/services/notificationService"

const validateStoryPoints = (story_points?: number | null) => {
    if (story_points === undefined || story_points === null) return

    if (!Number.isInteger(story_points) || story_points < 1 || story_points > 5) {
        throw new Error("Los story points deben ser un número entre 1 y 5")
    }
}

export const updateTaskUseCase = async (
    taskId: string,
    userId: string,
    data: {
        title?: string
        description?: string | null
        progress?: number
        story_points?: number | null
        priority?: TaskPriority
        status?: TaskStatus
        end_date?: Date | null
        id_sprint?: string | null
        assignedTo?: string | null
    }
) => {
    const task = await getTaskById(taskId)
    if (!task) {
        throw new Error("Tarea no encontrada")
    }

    let userRole = await getUserRoleInProject(userId, task.id_project)
    if (!userRole) {
        const project = await getProjectById(task.id_project)
        if (project && project.createdBy === userId) {
            userRole = ProjectRole.PROJECT_MANAGER
        }
    }
    const isPMorSM = userRole === ProjectRole.PROJECT_MANAGER || userRole === ProjectRole.SCRUM_MASTER
    const isAssigned = task.assignedTo === userId

    if (!isPMorSM && !isAssigned) {
        throw new Error("No tienes permisos para actualizar esta tarea")
    }

    if (data.progress !== undefined) {
        if (!Number.isFinite(data.progress) || data.progress < 0 || data.progress > 100) {
            throw new Error("El progreso debe estar entre 0 y 100")
        }
    }

    validateStoryPoints(data.story_points)

    if (
        data.story_points !== undefined &&
        data.story_points !== null &&
        userRole !== ProjectRole.PROJECT_MANAGER
    ) {
        throw new Error("Solo el Project Manager puede asignar story points")
    }

    if (data.status !== undefined && !Object.values(TaskStatus).includes(data.status)) {
        throw new Error("El estado no es válido")
    }

    if (data.id_sprint) {
        const sprint = await getSprintById(data.id_sprint)
        if (!sprint) {
            throw new Error("Sprint no encontrado")
        }
        if (sprint.id_project !== task.id_project) {
            throw new Error("El sprint no pertenece al proyecto")
        }
    }

    if (data.assignedTo) {
        const isMember = await isMemberProject(data.assignedTo, task.id_project)
        if (!isMember) {
            throw new Error("El usuario asignado no es miembro del proyecto")
        }
    }

    const patch: Partial<typeof data> & { completedAt?: Date | null } = { ...data }
    if (data.status !== undefined && data.status !== task.status) {
        patch.completedAt = data.status === TaskStatus.COMPLETED ? new Date() : null
    }

    const updated = await updateTask(taskId, patch)
    if (!updated) {
        throw new Error("No se pudo actualizar la tarea")
    }

    const finalAssignee = updated.assignedTo
    const assigneeChanged = data.assignedTo !== undefined && data.assignedTo !== task.assignedTo
    if (finalAssignee && assigneeChanged) {
        await notifyTaskAssigned(taskId, finalAssignee, userId)
    }

    // Aviso al asignado cuando la tarea pasa a completada.
    const justCompleted =
        data.status !== undefined &&
        data.status !== task.status &&
        data.status === TaskStatus.COMPLETED
    if (justCompleted) {
        await notifyTaskCompleted(taskId, userId)
    }

    return updated
}
