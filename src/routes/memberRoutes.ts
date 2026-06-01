import { Router } from "express"
import { requireAuth } from "../middlewares/requireAuth"
import {
    validateProjectIdParam,
    validateProjectAndUserParams,
    validateAddMemberBody,
    validateUpdateMemberBody
} from "../middlewares/validateMember"
import {
    addMemberController,
    getProjectMembersController,
    updateMemberController,
    removeMemberController
} from "../controllers/memberController"

const router = Router()

/**
 * @swagger
 * /projects/{projectId}/members:
 *   post:
 *     summary: Agregar miembro a proyecto
 *     tags: [Members]
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
 *             required: [userId, role]
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               role:
 *                 type: string
 *                 enum: [project_manager, scrum_master, developer, team_lead]
 *               fte:
 *                 type: number
 *                 nullable: true
 *                 description: Capacidad estimada (0 < fte <= 1)
 *                 example: 0.5
 *               monthly_rate:
 *                 type: number
 *                 nullable: true
 *                 description: Costo mensual del miembro (solo visible para admin/PM)
 *                 example: 4000
 *     responses:
 *       201:
 *         description: Miembro agregado
 *       400:
 *         description: Error de validación o permisos
 */
router.post(
    "/:projectId/members",
    requireAuth,
    validateProjectIdParam,
    validateAddMemberBody,
    addMemberController
)
/**
 * @swagger
 * /projects/{projectId}/members:
 *   get:
 *     summary: Obtener miembros del proyecto
 *     tags: [Members]
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
 *         description: Lista de miembros
 */
router.get(
    "/:projectId/members",
    requireAuth,
    validateProjectIdParam,
    getProjectMembersController
)

/**
 * @swagger
 * /projects/{projectId}/members/{userId}:
 *   patch:
 *     summary: Actualizar miembro (rol, FTE, rate)
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: userId
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
 *               role:
 *                 type: string
 *                 enum: [project_manager, scrum_master, developer, team_lead]
 *               fte:
 *                 type: number
 *                 nullable: true
 *                 example: 0.5
 *               monthly_rate:
 *                 type: number
 *                 nullable: true
 *                 example: 4000
 *     responses:
 *       200:
 *         description: Miembro actualizado
 */
router.patch(
    "/:projectId/members/:userId",
    requireAuth,
    validateProjectAndUserParams,
    validateUpdateMemberBody,
    updateMemberController
)
/**
 * @swagger
 * /projects/{projectId}/members/{userId}:
 *   delete:
 *     summary: Eliminar miembro del proyecto
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Miembro eliminado
 */
router.delete(
    "/:projectId/members/:userId",
    requireAuth,
    validateProjectAndUserParams,
    removeMemberController
)
export default router