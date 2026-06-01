import { Router } from "express"
import { requireAuth } from "../middlewares/requireAuth"
import { validateCreateProject, validateUpdateProject } from "../middlewares/validateProject"
import {
    createProjectController,
    getMyProjectsController,
    getProjectByIdController,
    updateProjectController,
    deleteProjectController,
    getProjectReportController,
    getProjectVelocityController,
    getProjectStoryPointsController,
    getProjectFinancialSummaryController,
    getProjectEvmController
} from "../controllers/projectController"

const router = Router()

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Crear un proyecto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, client, project_type, methodology, start_date, end_date, status]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Backlog App"
 *               description:
 *                 type: string
 *                 nullable: true
 *               client:
 *                 type: string
 *                 example: "Acme Corp"
 *               project_type:
 *                 type: string
 *                 example: "Web app"
 *               project_objective:
 *                 type: string
 *                 nullable: true
 *                 example: "Launch a central portal for customer onboarding"
 *               methodology:
 *                 type: string
 *                 enum: [scrum, kanban]
 *                 example: "scrum"
 *               estimated_sprints:
 *                 type: integer
 *                 example: 6
 *                 nullable: true
 *               budget:
 *                 type: number
 *                 example: 25000
 *                 nullable: true
 *               monthly_cost:
 *                 type: number
 *                 example: 3200
 *                 nullable: true
 *               billing_model:
 *                 type: string
 *                 enum: [fixed_price, time_and_materials, retainer]
 *                 nullable: true
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *                 example: "medium"
 *                 default: "medium"
 *               status:
 *                 type: string
 *                 enum: [planning, in_progress, completed]
 *                 example: "planning"
 *     responses:
 *       201:
 *         description: Proyecto creado correctamente
 *       400:
 *         description: Error de validacion
 *       401:
 *         description: Token invalido o solo administradores pueden crear proyectos
 */
router.post("/", requireAuth, validateCreateProject, createProjectController)

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Obtener mis proyectos
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos
 *       401:
 *         description: Token invalido
 */
router.get("/", requireAuth, getMyProjectsController)

/**
 * @swagger
 * /projects/{projectId}:
 *   get:
 *     summary: Obtener proyecto por id
 *     tags: [Projects]
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
 *         description: Proyecto encontrado
 *       404:
 *         description: Proyecto no encontrado
 */
router.get("/:projectId", requireAuth, getProjectByIdController)

/**
 * @swagger
 * /projects/{projectId}/velocity:
 *   get:
 *     summary: Velocity del proyecto (story points por sprint)
 *     tags: [Projects]
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
 *         description: Comprometido vs completado por sprint y velocity promedio de sprints finalizados
 *       404:
 *         description: Proyecto no encontrado o sin acceso
 */
router.get("/:projectId/velocity", requireAuth, getProjectVelocityController)

/**
 * @swagger
 * /projects/{projectId}/story-points:
 *   get:
 *     summary: Resumen de story points del proyecto (backlog)
 *     tags: [Projects]
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
 *         description: Puntos totales, desglose por estado y conteo de tareas estimadas/sin estimar
 *       404:
 *         description: Proyecto no encontrado o sin acceso
 */
router.get("/:projectId/story-points", requireAuth, getProjectStoryPointsController)

/**
 * @swagger
 * /projects/{projectId}/financial-summary:
 *   get:
 *     summary: Resumen financiero del proyecto (presupuesto, runway, burn y costos unitarios)
 *     description: >
 *       Deriva indicadores financieros a partir de budget, monthly_cost, fechas y story points.
 *       El gasto es una estimacion (costo mensual * meses transcurridos), no costo real.
 *       Los campos derivados se devuelven como null cuando faltan los datos de entrada.
 *     tags: [Projects]
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
 *         description: Runway, presupuesto consumido, serie de burn, costo por story point y notas de datos faltantes
 *       404:
 *         description: Proyecto no encontrado o sin acceso
 */
router.get("/:projectId/financial-summary", requireAuth, getProjectFinancialSummaryController)

/**
 * @swagger
 * /projects/{projectId}/evm:
 *   get:
 *     summary: Earned Value Management del proyecto (PV, EV, AC, CPI, SPI, EAC)
 *     description: >
 *       Metricas EVM a la fecha de estado mas una serie mensual (S-curve) de PV/EV/AC.
 *       EV se basa en story points (o conteo de tareas si no hay SP). AC se estima con los
 *       rates de los miembros (monthly_rate x fte) o, en su defecto, el monthly_cost del proyecto:
 *       el SPI es confiable, pero CPI/EAC son indicativos hasta tener time tracking.
 *       Los campos se devuelven null cuando faltan los datos de entrada.
 *     tags: [Projects]
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
 *         description: Metricas EVM, indices, serie S-curve y notas de supuestos
 *       404:
 *         description: Proyecto no encontrado o sin acceso
 */
router.get("/:projectId/evm", requireAuth, getProjectEvmController)

/**
 * @swagger
 * /projects/{projectId}:
 *   put:
 *     summary: Actualizar proyecto
 *     tags: [Projects]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *               client:
 *                 type: string
 *               project_type:
 *                 type: string
 *               project_objective:
 *                 type: string
 *                 nullable: true
 *               methodology:
 *                 type: string
 *                 enum: [scrum, kanban]
 *               estimated_sprints:
 *                 type: integer
 *                 nullable: true
 *               budget:
 *                 type: number
 *                 nullable: true
 *               monthly_cost:
 *                 type: number
 *                 nullable: true
 *               billing_model:
 *                 type: string
 *                 enum: [fixed_price, time_and_materials, retainer]
 *                 nullable: true
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *               status:
 *                 type: string
 *                 enum: [planning, in_progress, completed]
 *     responses:
 *       200:
 *         description: Proyecto actualizado correctamente
 *       400:
 *         description: Error de validacion o permisos
 *       404:
 *         description: Proyecto no encontrado
 */
router.put("/:projectId", requireAuth, validateUpdateProject, updateProjectController)

/**
 * @swagger
 * /projects/{projectId}:
 *   delete:
 *     summary: Eliminar proyecto
 *     tags: [Projects]
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
 *         description: Proyecto eliminado
 *       400:
 *         description: No se pudo eliminar
 */
router.delete("/:projectId", requireAuth, deleteProjectController)

/**
 * @swagger
 * /projects/{projectId}/report:
 *   get:
 *     summary: Generar reporte del proyecto en PDF
 *     tags: [Projects]
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
 *         description: PDF del reporte
 *       400:
 *         description: Error al generar el reporte
 *       401:
 *         description: Token invalido
 */
router.get("/:projectId/report", getProjectReportController)

export default router