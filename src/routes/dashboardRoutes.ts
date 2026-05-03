import { Router } from "express"
import { requireAuth } from "../middlewares/requireAuth"
import { getProjectsStatsController, getTasksStatsController } from "../controllers/dashboardController"

const router = Router()

/**
 * @swagger
 * /dashboard/projects-stats:
 *   get:
 *     summary: Obtener estadisticas y datos para graficas de proyectos del usuario autenticado
 *     description: |
 *       Retorna metricas agregadas y datos por proyecto listos para graficar.
 *       Todos los calculos (porcentaje de avance, conteos, dias restantes, atrasos) se hacen en backend.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadisticas calculadas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalProjects: { type: integer, example: 5 }
 *                         planningProjects: { type: integer, example: 1 }
 *                         inProgressProjects: { type: integer, example: 2 }
 *                         completedProjects: { type: integer, example: 2 }
 *                         overdueProjects: { type: integer, example: 0 }
 *                         totalTasks: { type: integer, example: 30 }
 *                         completedTasks: { type: integer, example: 18 }
 *                         inProgressTasks: { type: integer, example: 7 }
 *                         pendingTasks: { type: integer, example: 5 }
 *                     projectsByStatus:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                             enum: [planning, in_progress, completed]
 *                           count:
 *                             type: integer
 *                     projectsByPriority:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           priority:
 *                             type: string
 *                             enum: [high, medium, low]
 *                           count:
 *                             type: integer
 *                     projectsChart:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_project: { type: string, format: uuid }
 *                           name: { type: string }
 *                           status:
 *                             type: string
 *                             enum: [planning, in_progress, completed]
 *                           priority:
 *                             type: string
 *                             enum: [high, medium, low]
 *                           start_date: { type: string, format: date-time }
 *                           end_date:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           totalTasks: { type: integer }
 *                           completedTasks: { type: integer }
 *                           inProgressTasks: { type: integer }
 *                           pendingTasks: { type: integer }
 *                           completionPercentage:
 *                             type: number
 *                             description: Porcentaje (0-100) calculado como completedTasks / totalTasks * 100
 *                           isOverdue:
 *                             type: boolean
 *                             description: end_date pasado y proyecto sin completar
 *                           daysRemaining:
 *                             type: integer
 *                             nullable: true
 *                             description: Dias entre hoy y end_date (negativo si esta atrasado)
 *       401:
 *         description: Token invalido o no proporcionado
 */
router.get("/projects-stats", requireAuth, getProjectsStatsController)

/**
 * @swagger
 * /dashboard/tasks-stats:
 *   get:
 *     summary: Obtener estadisticas y datos para graficas de tareas del usuario autenticado
 *     description: |
 *       Retorna metricas agregadas y datos por proyecto y por usuario listos para graficar.
 *       Considera todas las tareas de los proyectos donde el usuario es creador o miembro.
 *       Todos los calculos (porcentaje de avance, conteos por estado/prioridad, atrasos) se hacen en backend.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadisticas calculadas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalTasks: { type: integer, example: 25 }
 *                         completedTasks: { type: integer, example: 12 }
 *                         inProgressTasks: { type: integer, example: 3 }
 *                         pendingTasks: { type: integer, example: 10 }
 *                         overdueTasks: { type: integer, example: 4 }
 *                         unassignedTasks: { type: integer, example: 5 }
 *                         completionPercentage:
 *                           type: number
 *                           example: 48
 *                           description: Porcentaje (0-100) calculado como completedTasks / totalTasks * 100
 *                         highPriorityTasks: { type: integer, example: 5 }
 *                         mediumPriorityTasks: { type: integer, example: 15 }
 *                         lowPriorityTasks: { type: integer, example: 5 }
 *                     tasksByStatus:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                             enum: [pending, in_progress, completed]
 *                           count:
 *                             type: integer
 *                     tasksByPriority:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           priority:
 *                             type: string
 *                             enum: [high, medium, low]
 *                           count:
 *                             type: integer
 *                     tasksByProject:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_project: { type: string, format: uuid }
 *                           name: { type: string }
 *                           totalTasks: { type: integer }
 *                           completedTasks: { type: integer }
 *                           inProgressTasks: { type: integer }
 *                           pendingTasks: { type: integer }
 *                           overdueTasks: { type: integer }
 *                           completionPercentage:
 *                             type: number
 *                             description: Porcentaje (0-100) calculado por proyecto
 *                     myTasks:
 *                       type: object
 *                       description: Breakdown de tareas asignadas al usuario autenticado
 *                       properties:
 *                         totalTasks: { type: integer }
 *                         completedTasks: { type: integer }
 *                         inProgressTasks: { type: integer }
 *                         pendingTasks: { type: integer }
 *                         overdueTasks: { type: integer }
 *       401:
 *         description: Token invalido o no proporcionado
 */
router.get("/tasks-stats", requireAuth, getTasksStatsController)

export default router
