import { createTask } from "../../infrastructure/repositories/TaskRepository"
import { getUserRoleInProject, isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { getSprintById } from "../../infrastructure/repositories/SprintRepository"
import { Task, TaskPriority, TaskStatus } from "../../entities/Task"
import { ProjectRole } from "../../entities/MemberProject"

export const createTaskUseCase = async (
    data: {
        title: string
        description: string
        task_number: number
        progress: number
        priority: TaskPriority
        status: TaskStatus
        start_date: Date
        end_date: Date
        id_sprint: string | null
        assignedTo: string
    },
    id_project: string,
    userId: string
): Promise<Task> => {
    const project = await getProjectById(id_project)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    const userRole = await getUserRoleInProject(userId, id_project)
    if (!userRole) {
        throw new Error("No tienes permisos en este proyecto")
    }

    if (userRole !== ProjectRole.PROJECT_MANAGER && userRole !== ProjectRole.SCRUM_MASTER) {
        throw new Error("Solo project_manager y scrum_master pueden crear tareas")
    }

    if (!data.title || data.title.trim().length === 0) {
        throw new Error("El título es obligatorio")
    }

    if (!data.description || data.description.trim().length === 0) {
        throw new Error("La descripción es obligatoria")
    }

    if (data.task_number === undefined || data.task_number === null) {
        throw new Error("El número de tarea es obligatorio")
    }
    if (!Number.isInteger(data.task_number) || data.task_number < 1) {
        throw new Error("El número de tarea debe ser un entero mayor o igual a 1")
    }

    if (data.progress === undefined || data.progress === null) {
        throw new Error("El progreso es obligatorio")
    }
    if (!Number.isFinite(data.progress) || data.progress < 0 || data.progress > 100) {
        throw new Error("El progreso debe estar entre 0 y 100")
    }

    if (!data.assignedTo) {
        throw new Error("El equipo designado (assignedTo) es obligatorio")
    }

    if (!data.start_date) {
        throw new Error("La fecha de inicio es obligatoria")
    }

    if (!data.end_date) {
        throw new Error("La fecha de fin es obligatoria")
    }

    if (data.start_date > data.end_date) {
        throw new Error("La fecha de inicio debe ser anterior a la fecha de fin")
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

    const isMember = await isMemberProject(data.assignedTo, id_project)
    if (!isMember && project.createdBy !== data.assignedTo) {
        throw new Error("El usuario asignado no es miembro del proyecto")
    }

    return await createTask({
        title: data.title,
        description: data.description,
        task_number: data.task_number,
        progress: data.progress,
        priority: data.priority,
        status: data.status,
        start_date: data.start_date,
        end_date: data.end_date,
        id_project,
        id_sprint: data.id_sprint,
        createdBy: userId,
        assignedTo: data.assignedTo
    })
}
