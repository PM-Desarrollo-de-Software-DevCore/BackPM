import { Router } from "express"
import { requireAuth } from "../middlewares/requireAuth"
import {
    createTaskController,
    getTasksByProjectController,
    getTasksBySprintController,
    getTaskByIdController,
    updateTaskController,
    deleteTaskController
} from "../controllers/taskController"

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Gestión de tareas
 */

export const projectTaskRouter = Router()
export const sprintTaskRouter = Router()
export const taskRouter = Router()

/**
 * @swagger
 * /projects/{projectId}/tasks:
 *   post:
 *     summary: Crear una tarea en el proyecto
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, start_date]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Implementar login"
 *               description:
 *                 type: string
 *                 nullable: true
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed]
 *                 default: pending
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               id_sprint:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               assignedTo:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Tarea creada correctamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 */
projectTaskRouter.post("/:projectId/tasks", requireAuth, createTaskController)

/**
 * @swagger
 * /projects/{projectId}/tasks:
 *   get:
 *     summary: Obtener tareas del proyecto
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de tareas del proyecto
 *       401:
 *         description: No autorizado
 */
projectTaskRouter.get("/:projectId/tasks", requireAuth, getTasksByProjectController)

/**
 * @swagger
 * /sprints/{sprintId}/tasks:
 *   get:
 *     summary: Obtener tareas del sprint
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de tareas del sprint
 *       401:
 *         description: No autorizado
 */
sprintTaskRouter.get("/:sprintId/tasks", requireAuth, getTasksBySprintController)

/**
 * @swagger
 * /tasks/{taskId}:
 *   get:
 *     summary: Obtener tarea por id
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tarea encontrada
 *       404:
 *         description: Tarea no encontrada
 */
taskRouter.get("/:taskId", requireAuth, getTaskByIdController)

/**
 * @swagger
 * /tasks/{taskId}:
 *   patch:
 *     summary: Actualizar tarea
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed]
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               id_sprint:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               assignedTo:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Tarea actualizada
 *       400:
 *         description: Error de validación
 */
taskRouter.patch("/:taskId", requireAuth, updateTaskController)

/**
 * @swagger
 * /tasks/{taskId}:
 *   delete:
 *     summary: Eliminar tarea
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tarea eliminada correctamente
 *       400:
 *         description: Error de validación
 */
taskRouter.delete("/:taskId", requireAuth, deleteTaskController)
