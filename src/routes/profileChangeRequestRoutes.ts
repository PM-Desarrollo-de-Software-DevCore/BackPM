import { Router } from "express"
import { requireAuth } from "../middlewares/requireAuth"
import {
    createProfileChangeRequestController,
    getMyProfileChangeRequestsController,
    getAllProfileChangeRequestsController,
    approveProfileChangeRequestController,
    rejectProfileChangeRequestController,
    cancelProfileChangeRequestController
} from "../controllers/profileChangeRequestController"

/**
 * @swagger
 * tags:
 *   name: ProfileChangeRequests
 *   description: Solicitudes de modificación de perfil con flujo de aprobación por administradores
 */

const router = Router()

/**
 * @swagger
 * /profile-change-requests:
 *   post:
 *     summary: Crear una solicitud de modificación de perfil
 *     description: |
 *       El usuario autenticado solicita cambiar uno o más campos de su perfil.
 *       Campos permitidos: `name`, `lastname`, `email`, `skill`, `area`.
 *       Solo se incluyen los campos a cambiar. Una vez creada, los administradores reciben una notificación.
 *     tags: [ProfileChangeRequests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Campos a modificar (al menos uno). Pueden ir al raíz o anidados bajo `proposedChanges`.
 *             properties:
 *               name: { type: string }
 *               lastname: { type: string }
 *               email: { type: string, format: email }
 *               skill: { type: string, nullable: true }
 *               area: { type: string, nullable: true }
 *               proposedChanges:
 *                 type: object
 *                 properties:
 *                   name: { type: string }
 *                   lastname: { type: string }
 *                   email: { type: string, format: email }
 *                   skill: { type: string, nullable: true }
 *                   area: { type: string, nullable: true }
 *     responses:
 *       201:
 *         description: Solicitud creada
 *       400:
 *         description: Validación fallida (campo no permitido, sin cambios, email inválido)
 *       401:
 *         description: No autorizado
 */
router.post("/", requireAuth, createProfileChangeRequestController)

/**
 * @swagger
 * /profile-change-requests/me:
 *   get:
 *     summary: Listar las solicitudes propias del usuario autenticado
 *     tags: [ProfileChangeRequests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitudes ordenadas por fecha de creación (más reciente primero)
 *       401:
 *         description: No autorizado
 */
router.get("/me", requireAuth, getMyProfileChangeRequestsController)

/**
 * @swagger
 * /profile-change-requests:
 *   get:
 *     summary: Listar todas las solicitudes (solo administradores)
 *     tags: [ProfileChangeRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled]
 *     responses:
 *       200:
 *         description: Lista de solicitudes
 *       400:
 *         description: Sin permisos o filtros inválidos
 *       401:
 *         description: No autorizado
 */
router.get("/", requireAuth, getAllProfileChangeRequestsController)

/**
 * @swagger
 * /profile-change-requests/{requestId}/approve:
 *   post:
 *     summary: Aprobar una solicitud (solo administradores)
 *     description: |
 *       Aplica los cambios propuestos al usuario solicitante y marca la solicitud como `approved`.
 *       Si el cambio incluye email, se valida que no esté en uso por otro usuario.
 *       Solo permitido cuando la solicitud está en estado `pending`.
 *     tags: [ProfileChangeRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Solicitud aprobada y cambios aplicados
 *       400:
 *         description: Sin permisos, solicitud no pendiente o email en conflicto
 *       401:
 *         description: No autorizado
 */
router.post("/:requestId/approve", requireAuth, approveProfileChangeRequestController)

/**
 * @swagger
 * /profile-change-requests/{requestId}/reject:
 *   post:
 *     summary: Rechazar una solicitud (solo administradores)
 *     tags: [ProfileChangeRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reviewNote:
 *                 type: string
 *                 description: Motivo opcional del rechazo (se incluye en la notificación al usuario)
 *     responses:
 *       200:
 *         description: Solicitud rechazada
 *       400:
 *         description: Sin permisos o solicitud no pendiente
 *       401:
 *         description: No autorizado
 */
router.post("/:requestId/reject", requireAuth, rejectProfileChangeRequestController)

/**
 * @swagger
 * /profile-change-requests/{requestId}:
 *   delete:
 *     summary: Cancelar una solicitud propia pendiente
 *     description: |
 *       Solo el dueño de la solicitud puede cancelarla y únicamente si está en estado `pending`.
 *       Los administradores reciben una notificación de la cancelación.
 *     tags: [ProfileChangeRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Solicitud cancelada
 *       400:
 *         description: No eres dueño o la solicitud no está pendiente
 *       401:
 *         description: No autorizado
 */
router.delete("/:requestId", requireAuth, cancelProfileChangeRequestController)

export default router
