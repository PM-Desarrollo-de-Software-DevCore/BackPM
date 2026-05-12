import { Router } from "express"
import { listUsersController, createUserController, updateUserController, deleteUserController, uploadProfileImageController, deleteProfileImageController } from "../controllers/userController"
import { getMyTasksController } from "../controllers/taskController"
import { requireAuth } from "../middlewares/requireAuth"
import { requireSelfOrAdmin } from "../middlewares/requireSelfOrAdmin"
import { uploadProfileImage } from "../middlewares/uploadProfileImage"

const router = Router()

// List users (requires auth)
router.get("/", requireAuth, listUsersController)

/**
 * @swagger
 * /users/me/tasks:
 *   get:
 *     summary: Listar tareas asignadas al usuario autenticado
 *     description: |
 *       Devuelve la lista plana de tareas donde `assignedTo` es el usuario autenticado.
 *       Soporta filtros opcionales por `status` y `priority`.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed]
 *       - in: query
 *         name: priority
 *         required: false
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: Lista de tareas asignadas al usuario
 *       400:
 *         description: Filtros invalidos
 *       401:
 *         description: No autorizado
 */
router.get("/me/tasks", requireAuth, getMyTasksController)

// Create user (admin or open depending on your policy)
router.post("/", requireAuth, createUserController)

// Update user
router.put("/:id", requireAuth, updateUserController)

// Delete user
router.delete("/:id", requireAuth, deleteUserController)

/**
 * @swagger
 * /users/{id}/profile-image:
 *   post:
 *     summary: Subir o reemplazar imagen de perfil del usuario
 *     description: |
 *       Sube una imagen de perfil para el usuario indicado. Reemplaza la imagen anterior si existia.
 *       Acepta JPEG, PNG o WEBP. Tamano maximo 5 MB.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagen de perfil actualizada
 *       400:
 *         description: Archivo invalido o no enviado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.post("/:id/profile-image", requireAuth, requireSelfOrAdmin(), uploadProfileImage.single("image"), uploadProfileImageController)

/**
 * @swagger
 * /users/{id}/profile-image:
 *   delete:
 *     summary: Eliminar imagen de perfil del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Imagen de perfil eliminada
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.delete("/:id/profile-image", requireAuth, requireSelfOrAdmin(), deleteProfileImageController)

export default router
