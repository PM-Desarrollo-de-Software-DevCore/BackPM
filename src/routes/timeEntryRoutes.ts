import { Router } from "express"
import { requireAuth } from "../middlewares/requireAuth"
import { validateCreateTimeEntry, validateUpdateTimeEntry } from "../middlewares/validateTimeEntry"
import {
    createTimeEntryController,
    getTimeEntriesByTaskController,
    getProjectTimeSummaryController,
    updateTimeEntryController,
    deleteTimeEntryController
} from "../controllers/timeEntryController"

/**
 * @swagger
 * tags:
 *   name: TimeEntries
 *   description: Registro de horas (time tracking) por tarea
 */

export const taskTimeEntryRouter = Router()
export const timeEntryRouter = Router()
export const projectTimeEntryRouter = Router()

/**
 * @swagger
 * /tasks/{taskId}/time-entries:
 *   post:
 *     summary: Registrar horas en una tarea
 *     tags: [TimeEntries]
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
 *             required: [hours, work_date]
 *             properties:
 *               hours:
 *                 type: number
 *                 example: 3.5
 *               work_date:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Registro de tiempo creado
 *       400:
 *         description: Error de validacion o sin acceso
 */
taskTimeEntryRouter.post("/:taskId/time-entries", requireAuth, validateCreateTimeEntry, createTimeEntryController)

/**
 * @swagger
 * /tasks/{taskId}/time-entries:
 *   get:
 *     summary: Listar los registros de horas de una tarea
 *     tags: [TimeEntries]
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
 *         description: Lista de registros de tiempo
 */
taskTimeEntryRouter.get("/:taskId/time-entries", requireAuth, getTimeEntriesByTaskController)

/**
 * @swagger
 * /projects/{projectId}/time-summary:
 *   get:
 *     summary: Resumen de horas del proyecto (total y desglose por usuario y tarea)
 *     tags: [TimeEntries]
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
 *         description: Totales de horas por usuario y por tarea
 *       404:
 *         description: Proyecto no encontrado o sin acceso
 */
projectTimeEntryRouter.get("/:projectId/time-summary", requireAuth, getProjectTimeSummaryController)

/**
 * @swagger
 * /time-entries/{timeEntryId}:
 *   patch:
 *     summary: Actualizar un registro de tiempo (autor o admin)
 *     tags: [TimeEntries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: timeEntryId
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
 *             properties:
 *               hours:
 *                 type: number
 *               work_date:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Registro de tiempo actualizado
 *       400:
 *         description: Error de validacion o permisos
 */
timeEntryRouter.patch("/:timeEntryId", requireAuth, validateUpdateTimeEntry, updateTimeEntryController)

/**
 * @swagger
 * /time-entries/{timeEntryId}:
 *   delete:
 *     summary: Eliminar un registro de tiempo (autor o admin)
 *     tags: [TimeEntries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: timeEntryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Registro de tiempo eliminado
 *       400:
 *         description: Error de validacion o permisos
 */
timeEntryRouter.delete("/:timeEntryId", requireAuth, deleteTimeEntryController)
