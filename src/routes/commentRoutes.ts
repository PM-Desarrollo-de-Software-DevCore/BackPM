import { Router } from "express"
import { requireAuth } from "../middlewares/requireAuth"
import {
    createCommentController,
    getCommentsByTaskController,
    getCommentByIdController,
    updateCommentController,
    deleteCommentController
} from "../controllers/commentController"

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Gestión de comentarios de tareas
 */

export const taskCommentRouter = Router()
export const commentRouter = Router()

/**
 * @swagger
 * /tasks/{taskId}/comments:
 *   post:
 *     summary: Crear un comentario en la tarea
 *     tags: [Comments]
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
 *             required: [comment]
 *             properties:
 *               comment:
 *                 type: string
 *                 example: "Iniciando el desarrollo de la pantalla de login"
 *     responses:
 *       201:
 *         description: Comentario creado correctamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 */
taskCommentRouter.post("/:taskId/comments", requireAuth, createCommentController)

/**
 * @swagger
 * /tasks/{taskId}/comments:
 *   get:
 *     summary: Obtener comentarios de una tarea
 *     tags: [Comments]
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
 *         description: Lista de comentarios de la tarea
 *       401:
 *         description: No autorizado
 */
taskCommentRouter.get("/:taskId/comments", requireAuth, getCommentsByTaskController)

/**
 * @swagger
 * /comments/{commentId}:
 *   get:
 *     summary: Obtener comentario por id
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Comentario encontrado
 *       404:
 *         description: Comentario no encontrado
 */
commentRouter.get("/:commentId", requireAuth, getCommentByIdController)

/**
 * @swagger
 * /comments/{commentId}:
 *   patch:
 *     summary: Actualizar el contenido de un comentario (solo el autor)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
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
 *             required: [comment]
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comentario actualizado
 *       400:
 *         description: Error de validación
 */
commentRouter.patch("/:commentId", requireAuth, updateCommentController)

/**
 * @swagger
 * /comments/{commentId}:
 *   delete:
 *     summary: Eliminar comentario (autor o project_manager)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Comentario eliminado correctamente
 *       400:
 *         description: Error de validación
 */
commentRouter.delete("/:commentId", requireAuth, deleteCommentController)
