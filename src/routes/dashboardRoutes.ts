import { Router } from "express"
import { requireAuth } from "../middlewares/requireAuth"
import { getProjectsStatsController, getTasksStatsController, getUserTasksController, getWeeklyProgressController, getFinancialPortfolioController, getMilestonesOverviewController, getSearchIndexController, getProjectsMembersController } from "../controllers/dashboardController"

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

/**
 * @swagger
 * /dashboard/user-tasks:
 *   get:
 *     summary: Listar las tareas del usuario autenticado con info de proyecto y atrasos
 *     description: |
 *       Devuelve las tareas donde el usuario autenticado es el `assignedTo`,
 *       con el nombre del proyecto al que pertenecen y el flag `isOverdue`.
 *       Soporta filtros opcionales por `status` y `priority`.
 *     tags: [Dashboard]
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
 *         description: Lista calculada correctamente
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
 *                     total: { type: integer, example: 4 }
 *                     tasks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_task: { type: string, format: uuid }
 *                           title: { type: string }
 *                           description: { type: string, nullable: true }
 *                           task_number: { type: integer }
 *                           progress: { type: integer }
 *                           priority:
 *                             type: string
 *                             enum: [low, medium, high]
 *                           status:
 *                             type: string
 *                             enum: [pending, in_progress, completed]
 *                           end_date:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           project:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id_project: { type: string, format: uuid }
 *                               name: { type: string }
 *                           isOverdue:
 *                             type: boolean
 *                             description: end_date pasado y status != completed
 *       400:
 *         description: Filtros invalidos
 *       401:
 *         description: No autorizado
 */
router.get("/user-tasks", requireAuth, getUserTasksController)

/**
 * @swagger
 * /dashboard/weekly-progress:
 *   get:
 *     summary: Obtener progreso semanal (tareas completadas por dia)
 *     description: |
 *       Retorna el numero de tareas completadas en cada dia de la semana indicada.
 *       Considera solo tareas con `status = completed` y un `completedAt` dentro del rango Lun-Dom.
 *       Por defecto retorna la semana actual; usar `weekOffset` para navegar semanas anteriores.
 *       Si se pasa `projectId`, restringe el calculo a ese proyecto (debe ser accesible para el usuario).
 *       Si se omite, agrega todos los proyectos a los que el usuario tiene acceso (creador o miembro).
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: weekOffset
 *         required: false
 *         schema:
 *           type: integer
 *           maximum: 0
 *           default: 0
 *         description: 0 = semana en curso, -1 = semana anterior, -2 = dos semanas atras, etc.
 *       - in: query
 *         name: projectId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar el conteo a un proyecto especifico
 *     responses:
 *       200:
 *         description: Progreso semanal calculado correctamente
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
 *                     weekRange:
 *                       type: object
 *                       properties:
 *                         start: { type: string, format: date-time }
 *                         end: { type: string, format: date-time }
 *                         weekOffset: { type: integer, example: 0 }
 *                     totalCompleted:
 *                       type: integer
 *                       example: 12
 *                     dailyCompletions:
 *                       type: array
 *                       description: Siempre 7 elementos en orden Lunes -> Domingo
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             example: "2026-05-11"
 *                           dayOfWeek:
 *                             type: string
 *                             enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                           completed:
 *                             type: integer
 *                             example: 2
 *       400:
 *         description: Parametros invalidos
 *       401:
 *         description: No autorizado
 */
router.get("/weekly-progress", requireAuth, getWeeklyProgressController)

/**
 * @swagger
 * /dashboard/financial-portfolio:
 *   get:
 *     summary: Portafolio financiero (agregado de los proyectos del usuario)
 *     description: |
 *       Agrega los indicadores financieros de todos los proyectos a los que el usuario tiene acceso
 *       (creador o miembro): presupuesto, gasto estimado, runway y proyectos en riesgo de sobrecosto.
 *       El gasto es estimado (monthly_cost x meses transcurridos), no costo real. Campos null cuando faltan datos.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen del portafolio y desglose por proyecto
 *       401:
 *         description: Token invalido o no proporcionado
 */
router.get("/financial-portfolio", requireAuth, getFinancialPortfolioController)

/**
 * @swagger
 * /dashboard/milestones-overview:
 *   get:
 *     summary: Datos agregados para la vista de Milestones en UNA sola respuesta
 *     description: |
 *       Devuelve en una sola llamada todo lo que la pagina de milestones necesitaba con
 *       3 + 2*N requests: proyectos del usuario, sus estadisticas (projectStats), los usuarios
 *       referenciados, y los members y sprints de todos los proyectos (queries bulk con IN).
 *       Proyeccion segura: sin monthly_rate/fte en members ni campos financieros en projects.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview agregado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_project: { type: string, format: uuid }
 *                           name: { type: string }
 *                           description: { type: string, nullable: true }
 *                           start_date: { type: string, format: date-time }
 *                           end_date: { type: string, format: date-time, nullable: true }
 *                           priority: { type: string, enum: [high, medium, low] }
 *                           status: { type: string, enum: [planning, in_progress, completed] }
 *                           createdBy: { type: string, format: uuid }
 *                           createdAt: { type: string, format: date-time }
 *                     projectStats:
 *                       type: array
 *                       description: Igual que projectsChart de /dashboard/projects-stats
 *                       items: { type: object }
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: string, format: uuid }
 *                           email: { type: string }
 *                           name: { type: string }
 *                           lastname: { type: string }
 *                           profileImageUrl: { type: string, nullable: true }
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_mp: { type: string, format: uuid }
 *                           id_user: { type: string, format: uuid }
 *                           id_project: { type: string, format: uuid }
 *                           role: { type: string, enum: [project_manager, scrum_master, developer, team_lead] }
 *                     sprints:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_sprint: { type: string, format: uuid }
 *                           name: { type: string }
 *                           start_date: { type: string, format: date-time }
 *                           end_date: { type: string, format: date-time }
 *                           status: { type: string, enum: [planned, active, finished] }
 *                           id_project: { type: string, format: uuid }
 *                           createdAt: { type: string, format: date-time }
 *       401:
 *         description: Token invalido o no proporcionado
 */
router.get("/milestones-overview", requireAuth, getMilestonesOverviewController)

/**
 * @swagger
 * /dashboard/search-index:
 *   get:
 *     summary: Índice del buscador global (sprints + tasks de todos los proyectos del usuario)
 *     description: |
 *       Devuelve en UNA respuesta los sprints y tasks de todos los proyectos del usuario
 *       (queries bulk con IN), reemplazando el 1 + 2*N requests que hacía GlobalSearchBar.
 *       Cada sprint/task incluye id_project para joinear con la lista de proyectos en el cliente.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sprints y tasks agregados
 *       401:
 *         description: Token invalido o no proporcionado
 */
router.get("/search-index", requireAuth, getSearchIndexController)

/**
 * @swagger
 * /dashboard/projects-members:
 *   get:
 *     summary: Miembros de todos los proyectos del usuario en una sola respuesta
 *     description: |
 *       Devuelve los miembros (id_project, id_user, role) de todos los proyectos del usuario
 *       en una query bulk con IN, reemplazando el N+1 de la lista de proyectos (un
 *       GET /projects/:id/members por tarjeta). Proyeccion segura: sin monthly_rate ni fte.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Miembros agregados
 *       401:
 *         description: Token invalido o no proporcionado
 */
router.get("/projects-members", requireAuth, getProjectsMembersController)

export default router
