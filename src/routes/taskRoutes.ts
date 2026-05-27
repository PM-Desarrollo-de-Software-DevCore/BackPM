import { Router } from "express"
import { requireAuth } from "../middlewares/requireAuth"
import {
    createTaskController,
    getTasksByProjectController,
    getTasksBySprintController,
    getTaskByIdController,
    updateTaskController,
    updateTaskStoryPointsController,
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
 *             required: [title, progress, end_date]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Implementar login"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: "Construir el flujo de autenticación con JWT"
 *               progress:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 0
 *                 description: Porcentaje de avance (0-100)
 *               story_points:
 *                 type: integer
 *                 minimum: 0
 *                 nullable: true
 *                 example: 5
 *                 description: Estimación de esfuerzo (entero >= 0; null si la tarea no está estimada)
 *               assignedTo:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: Usuario / equipo designado (opcional, debe ser miembro del proyecto si se indica)
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed]
 *                 default: pending
 *               id_sprint:
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
 *               progress:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               story_points:
 *                 type: integer
 *                 minimum: 0
 *                 nullable: true
 *                 description: Estimación de esfuerzo (entero >= 0; null para des-estimar)
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed]
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
 * /tasks/{taskId}/story-points:
 *   patch:
 *     summary: Actualizar solo los story points de una tarea
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [story_points]
 *             properties:
 *               story_points:
 *                 type: integer
 *                 minimum: 0
 *                 nullable: true
 *                 example: 5
 *                 description: Entero >= 0, o null para des-estimar la tarea
 *     responses:
 *       200:
 *         description: Story points actualizados
 *       400:
 *         description: Error de validación o sin permisos
 */
taskRouter.patch("/:taskId/story-points", requireAuth, updateTaskStoryPointsController)

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
