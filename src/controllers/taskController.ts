import { Response, Request } from "express"
import { AuthenticatedRequest } from "../middlewares/requireAuth"
import { TaskPriority, TaskStatus } from "../entities/Task"
import { createTaskUseCase } from "../use-cases/tasks/CreateTask"
import { getTasksByProjectUseCase } from "../use-cases/tasks/GetTasksByProject"
import { getTasksBySprintUseCase } from "../use-cases/tasks/GetTasksBySprint"
import { getTaskByIdUseCase } from "../use-cases/tasks/GetTaskById"
import { updateTaskUseCase } from "../use-cases/tasks/UpdateTask"
import { deleteTaskUseCase } from "../use-cases/tasks/DeleteTask"

type ProjectParams = { projectId: string }
type SprintParams = { sprintId: string }
type TaskParams = { taskId: string }

type ProjectRequest = AuthenticatedRequest & Request<ProjectParams>
type SprintRequest = AuthenticatedRequest & Request<SprintParams>
type TaskRequest = AuthenticatedRequest & Request<TaskParams>

export const createTaskController = async (req: ProjectRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { projectId } = req.params
        const { title, description, priority, status, start_date, end_date, id_sprint, assignedTo } = req.body

        if (!start_date) {
            return res.status(400).json({ success: false, message: "La fecha de inicio es obligatoria" })
        }

        const result = await createTaskUseCase(
            {
                title,
                description: description ?? null,
                priority: priority ?? TaskPriority.MEDIUM,
                status: status ?? TaskStatus.PENDING,
                start_date: new Date(start_date),
                end_date: end_date ? new Date(end_date) : null,
                id_sprint: id_sprint ?? null,
                assignedTo: assignedTo ?? null
            },
            projectId,
            req.userId
        )

        return res.status(201).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getTasksByProjectController = async (req: ProjectRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { projectId } = req.params
        const result = await getTasksByProjectUseCase(projectId, req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getTasksBySprintController = async (req: SprintRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { sprintId } = req.params
        const result = await getTasksBySprintUseCase(sprintId, req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const getTaskByIdController = async (req: TaskRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { taskId } = req.params
        const result = await getTaskByIdUseCase(taskId, req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message })
    }
}

export const updateTaskController = async (req: TaskRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { taskId } = req.params
        const body = req.body

        const result = await updateTaskUseCase(taskId, req.userId, {
            ...body,
            start_date: body.start_date ? new Date(body.start_date) : undefined,
            end_date: body.end_date !== undefined
                ? (body.end_date ? new Date(body.end_date) : null)
                : undefined
        })

        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const deleteTaskController = async (req: TaskRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const { taskId } = req.params
        const result = await deleteTaskUseCase(taskId, req.userId)
        return res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message })
    }
}
