import { Router } from "express"
import { requireAuth } from "../middlewares/requireAuth"
import {
    addUserTechnologyController,
    getUserTechnologiesController,
    getUserTechnologyByIdController,
    updateUserTechnologyController,
    deleteUserTechnologyController
} from "../controllers/userTechnologyController"

/**
 * @swagger
 * tags:
 *   name: UserTechnologies
 *   description: Gestion de tecnologias de un usuario y sus anos de experiencia
 */

export const userTechnologyRouter = Router()
export const technologyRouter = Router()

/**
 * @swagger
 * /users/{id}/technologies:
 *   post:
 *     summary: Agregar una tecnologia al usuario con sus anos de experiencia
 *     tags: [UserTechnologies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             required: [technology, yearsOfExperience]
 *             properties:
 *               technology:
 *                 type: string
 *                 maxLength: 100
 *                 example: "React"
 *               yearsOfExperience:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 80
 *                 example: 3
 *     responses:
 *       201:
 *         description: Tecnologia agregada correctamente
 *       400:
 *         description: Error de validacion o tecnologia duplicada
 *       401:
 *         description: No autorizado
 */
userTechnologyRouter.post("/:id/technologies", requireAuth, addUserTechnologyController)

/**
 * @swagger
 * /users/{id}/technologies:
 *   get:
 *     summary: Listar tecnologias y anos de experiencia del usuario
 *     tags: [UserTechnologies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de tecnologias del usuario
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
userTechnologyRouter.get("/:id/technologies", requireAuth, getUserTechnologiesController)

/**
 * @swagger
 * /technologies/{techId}:
 *   get:
 *     summary: Obtener una tecnologia por id
 *     tags: [UserTechnologies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: techId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tecnologia encontrada
 *       404:
 *         description: Tecnologia no encontrada
 */
technologyRouter.get("/:techId", requireAuth, getUserTechnologyByIdController)

/**
 * @swagger
 * /technologies/{techId}:
 *   patch:
 *     summary: Actualizar tecnologia o anos de experiencia (dueno o admin)
 *     tags: [UserTechnologies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: techId
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
 *               technology:
 *                 type: string
 *                 maxLength: 100
 *               yearsOfExperience:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 80
 *     responses:
 *       200:
 *         description: Tecnologia actualizada
 *       400:
 *         description: Error de validacion
 *       401:
 *         description: No autorizado
 */
technologyRouter.patch("/:techId", requireAuth, updateUserTechnologyController)

/**
 * @swagger
 * /technologies/{techId}:
 *   delete:
 *     summary: Eliminar una tecnologia del perfil (dueno o admin)
 *     tags: [UserTechnologies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: techId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tecnologia eliminada
 *       400:
 *         description: Error de validacion
 */
technologyRouter.delete("/:techId", requireAuth, deleteUserTechnologyController)
