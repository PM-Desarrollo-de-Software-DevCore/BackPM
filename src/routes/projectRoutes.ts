import { Router } from "express"
import { requireAuth } from "../middlewares/requireAuth"
import { validateCreateProject, validateUpdateProject } from "../middlewares/validateProject"
import {
    createProjectController,
    getMyProjectsController,
    getProjectByIdController,
    updateProjectController,
    deleteProjectController
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
 *             required: [name, start_date]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Backlog App"
 *               description:
 *                 type: string
 *                 nullable: true
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               status:
 *                 type: string
 *                 enum: [active, finished, paused]
 *     responses:
 *       201:
 *         description: Proyecto creado correctamente
 *       400:
 *         description: Error de validacion
 *       401:
 *         description: Token invalido
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
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               status:
 *                 type: string
 *                 enum: [active, finished, paused]
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 *       400:
 *         description: Error de validacion o permisos
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

export default router