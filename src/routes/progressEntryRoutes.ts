import { Router } from "express"
import { requireAuth } from "../middlewares/requireAuth"
import {
    createProgressEntryController,
    getProgressEntriesByProjectController,
    deleteProgressEntryController
} from "../controllers/progressEntryController"

/**
 * @swagger
 * tags:
 *   name: ProgressEntries
 *   description: Registro periódico de avances y bloqueadores del proyecto (opcionalmente por sprint)
 */

export const projectProgressEntryRouter = Router()
export const progressEntryRouter = Router()

/**
 * @swagger
 * /projects/{projectId}/progress-entries:
 *   post:
 *     summary: Registrar un avance o bloqueador en el proyecto
 *     tags: [ProgressEntries]
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
 *             required: [type, description]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [progress, blocker]
 *                 description: "progress = avance, blocker = bloqueador"
 *               description:
 *                 type: string
 *                 example: "Se integró el login con JWT"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha del registro (opcional; default = ahora)
 *               id_sprint:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: Sprint al que pertenece el registro (opcional)
 *     responses:
 *       201:
 *         description: Registro creado
 *       400:
 *         description: Error de validación o sin acceso
 *       401:
 *         description: No autorizado
 */
projectProgressEntryRouter.post("/:projectId/progress-entries", requireAuth, createProgressEntryController)

/**
 * @swagger
 * /projects/{projectId}/progress-entries:
 *   get:
 *     summary: Lista histórica de avances y bloqueadores del proyecto
 *     tags: [ProgressEntries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [progress, blocker]
 *         description: Filtrar por tipo (avance o bloqueador)
 *       - in: query
 *         name: sprintId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por sprint
 *     responses:
 *       200:
 *         description: Lista ordenada por fecha (más reciente primero)
 *       401:
 *         description: No autorizado
 */
projectProgressEntryRouter.get("/:projectId/progress-entries", requireAuth, getProgressEntriesByProjectController)

/**
 * @swagger
 * /progress-entries/{entryId}:
 *   delete:
 *     summary: Eliminar un registro (solo el autor o PM/Scrum Master)
 *     tags: [ProgressEntries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Registro eliminado
 *       400:
 *         description: Error de validación o sin permisos
 */
progressEntryRouter.delete("/:entryId", requireAuth, deleteProgressEntryController)
