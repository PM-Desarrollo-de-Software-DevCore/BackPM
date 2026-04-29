import { Router } from "express"
import { requireAuth } from "../middlewares/requireAuth"
import {
    validateProjectIdParam,
    validateProjectAndUserParams,
    validateAddMemberBody,
    validateUpdateMemberRoleBody
} from "../middlewares/validateMember"
import {
    addMemberController,
    getProjectMembersController,
    updateMemberRoleController,
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
 *                 enum: [project_manager, scrum_master, developer]
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
 *     summary: Cambiar rol de miembro
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
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [project_manager, scrum_master, developer]
 *     responses:
 *       200:
 *         description: Rol actualizado
 */
router.patch(
    "/:projectId/members/:userId",
    requireAuth,
    validateProjectAndUserParams,
    validateUpdateMemberRoleBody,
    updateMemberRoleController
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