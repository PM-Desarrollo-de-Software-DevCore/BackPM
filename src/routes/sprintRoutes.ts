import { Router } from "express"
import { requireAuth } from "../middlewares/requireAuth"
import {
    createSprintController,
    getSprintsController,
    getSprintByIdController,
    updateSprintController,
    deleteSprintController
} from "../controllers/sprintController"

const router = Router()

/**
 * @swagger
 * /projects/{projectId}/sprints:
 *   post:
 *     summary: Crear un sprint
 *     tags: [Sprints]
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
 *             required: [name, start_date, end_date]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Sprint 1"
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [planned, active, finished]
 *     responses:
 *       201:
 *         description: Sprint creado correctamente
 *       400:
 *         description: Error de validación
 */
router.post("/:projectId/sprints", requireAuth, createSprintController)

/**
 * @swagger
 * /projects/{projectId}/sprints:
 *   get:
 *     summary: Obtener sprints del proyecto
 *     tags: [Sprints]
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
 *         description: Lista de sprints
 */
router.get("/:projectId/sprints", requireAuth, getSprintsController)

/**
 * @swagger
 * /sprints/{sprintId}:
 *   get:
 *     summary: Obtener sprint por id
 *     tags: [Sprints]
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
 *         description: Sprint encontrado
 */
router.get("/:sprintId", requireAuth, getSprintByIdController)

/**
 * @swagger
 * /sprints/{sprintId}:
 *   patch:
 *     summary: Actualizar sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sprintId
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
 *               name:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [planned, active, finished]
 *     responses:
 *       200:
 *         description: Sprint actualizado
 */
router.patch("/:sprintId", requireAuth, updateSprintController)

/**
 * @swagger
 * /sprints/{sprintId}:
 *   delete:
 *     summary: Eliminar sprint
 *     tags: [Sprints]
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
 *         description: Sprint eliminado
 */
router.delete("/:sprintId", requireAuth, deleteSprintController)

export default router