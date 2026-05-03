import { Router } from "express"
import { listUsersController, createUserController, updateUserController, deleteUserController } from "../controllers/userController"
import { getMyTasksController } from "../controllers/taskController"
import { requireAuth } from "../middlewares/requireAuth"

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

export default router
