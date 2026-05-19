import { Router } from "express"
import { requireAuth } from "../middlewares/requireAuth"
import {
    getGlobalLeaderboardController,
    getProjectLeaderboardController
} from "../controllers/leaderboardController"

/**
 * @swagger
 * tags:
 *   name: Leaderboard
 *   description: Ranking de usuarios por puntos acumulados al completar tareas
 */

export const leaderboardRouter = Router()
export const projectLeaderboardRouter = Router()

/**
 * @swagger
 * /leaderboard:
 *   get:
 *     summary: Obtener ranking global de usuarios por puntos
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 5
 *     responses:
 *       200:
 *         description: Lista de usuarios ordenada por puntos (descendente)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       lastname:
 *                         type: string
 *                       profileImageUrl:
 *                         type: string
 *                         nullable: true
 *                       points:
 *                         type: integer
 *       401:
 *         description: No autorizado
 */
leaderboardRouter.get("/", requireAuth, getGlobalLeaderboardController)

/**
 * @swagger
 * /projects/{projectId}/leaderboard:
 *   get:
 *     summary: Obtener ranking de miembros de un proyecto por puntos
 *     tags: [Leaderboard]
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
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 5
 *     responses:
 *       200:
 *         description: Lista de miembros del proyecto ordenada por puntos (descendente)
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No eres miembro del proyecto
 */
projectLeaderboardRouter.get("/:projectId/leaderboard", requireAuth, getProjectLeaderboardController)
