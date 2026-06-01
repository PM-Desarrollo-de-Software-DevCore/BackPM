import { Router } from "express"
import { requireAuth } from "../middlewares/requireAuth"
import { validateCreateInvoice, validateUpdateInvoice } from "../middlewares/validateInvoice"
import {
    createInvoiceController,
    getProjectInvoicesController,
    updateInvoiceController,
    deleteInvoiceController
} from "../controllers/invoiceController"

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Facturacion del proyecto (segun billing_model)
 */

export const projectInvoiceRouter = Router()
export const invoiceRouter = Router()

/**
 * @swagger
 * /projects/{projectId}/invoices:
 *   post:
 *     summary: Crear una factura del proyecto (admin o PM)
 *     tags: [Invoices]
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
 *             required: [amount, issue_date]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 15000
 *               status:
 *                 type: string
 *                 enum: [draft, sent, paid]
 *                 default: draft
 *               concept:
 *                 type: string
 *                 nullable: true
 *               issue_date:
 *                 type: string
 *                 format: date-time
 *               due_date:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               period_start:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: Para time_and_materials / retainer
 *               period_end:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               id_milestone:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: Para fixed_price (hito facturado)
 *     responses:
 *       201:
 *         description: Factura creada
 *       400:
 *         description: Error de validacion o permisos
 */
projectInvoiceRouter.post("/:projectId/invoices", requireAuth, validateCreateInvoice, createInvoiceController)

/**
 * @swagger
 * /projects/{projectId}/invoices:
 *   get:
 *     summary: Listar facturas del proyecto con resumen de facturacion
 *     tags: [Invoices]
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
 *         description: Resumen (facturado/pagado/pendiente vs presupuesto) y lista de facturas
 *       404:
 *         description: Proyecto no encontrado o sin acceso
 */
projectInvoiceRouter.get("/:projectId/invoices", requireAuth, getProjectInvoicesController)

/**
 * @swagger
 * /invoices/{invoiceId}:
 *   patch:
 *     summary: Actualizar una factura (admin o PM)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
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
 *               status:
 *                 type: string
 *                 enum: [draft, sent, paid]
 *               concept:
 *                 type: string
 *                 nullable: true
 *               issue_date:
 *                 type: string
 *                 format: date-time
 *               due_date:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               period_start:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               period_end:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               id_milestone:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Factura actualizada
 *       400:
 *         description: Error de validacion o permisos
 */
invoiceRouter.patch("/:invoiceId", requireAuth, validateUpdateInvoice, updateInvoiceController)

/**
 * @swagger
 * /invoices/{invoiceId}:
 *   delete:
 *     summary: Eliminar una factura (admin o PM)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Factura eliminada
 *       400:
 *         description: Error de validacion o permisos
 */
invoiceRouter.delete("/:invoiceId", requireAuth, deleteInvoiceController)
