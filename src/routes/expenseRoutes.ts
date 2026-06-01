import { Router } from "express"
import { requireAuth } from "../middlewares/requireAuth"
import { validateCreateExpense, validateUpdateExpense } from "../middlewares/validateExpense"
import {
    createExpenseController,
    getExpensesByProjectController,
    updateExpenseController,
    deleteExpenseController
} from "../controllers/expenseController"

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Gastos (no nomina) del proyecto
 */

export const projectExpenseRouter = Router()
export const expenseRouter = Router()

/**
 * @swagger
 * /projects/{projectId}/expenses:
 *   post:
 *     summary: Registrar un gasto del proyecto (admin o PM)
 *     tags: [Expenses]
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
 *             required: [amount, category, date]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1200
 *               category:
 *                 type: string
 *                 enum: [software, infrastructure, services, travel, other]
 *               description:
 *                 type: string
 *                 nullable: true
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Gasto registrado
 *       400:
 *         description: Error de validacion o permisos
 */
projectExpenseRouter.post("/:projectId/expenses", requireAuth, validateCreateExpense, createExpenseController)

/**
 * @swagger
 * /projects/{projectId}/expenses:
 *   get:
 *     summary: Listar los gastos del proyecto
 *     tags: [Expenses]
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
 *         description: Lista de gastos
 *       404:
 *         description: Proyecto no encontrado o sin acceso
 */
projectExpenseRouter.get("/:projectId/expenses", requireAuth, getExpensesByProjectController)

/**
 * @swagger
 * /expenses/{expenseId}:
 *   patch:
 *     summary: Actualizar un gasto (admin o PM)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseId
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
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *                 enum: [software, infrastructure, services, travel, other]
 *               description:
 *                 type: string
 *                 nullable: true
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Gasto actualizado
 *       400:
 *         description: Error de validacion o permisos
 */
expenseRouter.patch("/:expenseId", requireAuth, validateUpdateExpense, updateExpenseController)

/**
 * @swagger
 * /expenses/{expenseId}:
 *   delete:
 *     summary: Eliminar un gasto (admin o PM)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Gasto eliminado
 *       400:
 *         description: Error de validacion o permisos
 */
expenseRouter.delete("/:expenseId", requireAuth, deleteExpenseController)
