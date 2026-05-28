import { Router } from "express"
import { requireAuth } from "../middlewares/requireAuth"
import {
    createMilestoneController,
    getMilestonesByProjectController,
    getOverdueMilestonesCountController,
    getOverdueMilestonesSummaryController,
    getMilestoneByIdController,
    updateMilestoneController,
    deleteMilestoneController
} from "../controllers/milestoneController"

/**
 * @swagger
 * tags:
 *   name: Milestones
 *   description: Gestión de hitos del proyecto y cálculo de hitos retrasados
 */

export const projectMilestoneRouter = Router()
export const milestoneRouter = Router()

/**
 * @swagger
 * /projects/{projectId}/milestones:
 *   post:
 *     summary: Crear un hito en el proyecto
 *     tags: [Milestones]
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
 *             required: [title, due_date]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Entrega del MVP"
 *               description:
 *                 type: string
 *                 nullable: true
 *               due_date:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha objetivo del hito
 *     responses:
 *       201:
 *         description: Hito creado correctamente
 *       400:
 *         description: Error de validación o sin permisos
 *       401:
 *         description: No autorizado
 */
projectMilestoneRouter.post("/:projectId/milestones", requireAuth, createMilestoneController)

/**
 * @swagger
 * /projects/{projectId}/milestones:
 *   get:
 *     summary: Listar los hitos del proyecto (cada uno con completed e isOverdue)
 *     tags: [Milestones]
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
 *         description: Lista de hitos del proyecto
 *       401:
 *         description: No autorizado
 */
projectMilestoneRouter.get("/:projectId/milestones", requireAuth, getMilestonesByProjectController)

/**
 * @swagger
 * /projects/{projectId}/milestones/overdue-count:
 *   get:
 *     summary: Número de hitos retrasados del proyecto
 *     description: Cuenta los hitos con due_date pasado y aún no completados (completedAt null).
 *     tags: [Milestones]
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
 *         description: Conteo de hitos retrasados y total
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectId: { type: string, format: uuid }
 *                     overdueMilestones: { type: integer, example: 2 }
 *                     totalMilestones: { type: integer, example: 5 }
 *       401:
 *         description: No autorizado
 */
projectMilestoneRouter.get("/:projectId/milestones/overdue-count", requireAuth, getOverdueMilestonesCountController)

/**
 * @swagger
 * /milestones/overdue-count:
 *   get:
 *     summary: Número total de hitos retrasados del usuario
 *     description: Agrega los hitos retrasados (due_date pasado y no completados) de todos los proyectos del usuario.
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conteo global de hitos retrasados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     overdueMilestones: { type: integer, example: 3 }
 *                     projectsConsidered: { type: integer, example: 4 }
 *       401:
 *         description: No autorizado
 */
milestoneRouter.get("/overdue-count", requireAuth, getOverdueMilestonesSummaryController)

/**
 * @swagger
 * /milestones/{milestoneId}:
 *   get:
 *     summary: Obtener hito por id
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: milestoneId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Hito encontrado
 *       404:
 *         description: Hito no encontrado o sin acceso
 */
milestoneRouter.get("/:milestoneId", requireAuth, getMilestoneByIdController)

/**
 * @swagger
 * /milestones/{milestoneId}:
 *   patch:
 *     summary: Actualizar un hito
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: milestoneId
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
 *               due_date:
 *                 type: string
 *                 format: date-time
 *               completed:
 *                 type: boolean
 *                 description: true marca el hito como completado (setea completedAt); false lo reabre
 *     responses:
 *       200:
 *         description: Hito actualizado
 *       400:
 *         description: Error de validación o sin permisos
 */
milestoneRouter.patch("/:milestoneId", requireAuth, updateMilestoneController)

/**
 * @swagger
 * /milestones/{milestoneId}:
 *   delete:
 *     summary: Eliminar un hito
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: milestoneId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Hito eliminado correctamente
 *       400:
 *         description: Error de validación o sin permisos
 */
milestoneRouter.delete("/:milestoneId", requireAuth, deleteMilestoneController)
