import { getInvoiceById, updateInvoice } from "../../infrastructure/repositories/InvoiceRepository"
import { getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { GlobalRole } from "../../entities/User"
import { ProjectRole } from "../../entities/MemberProject"
import { Invoice, InvoiceStatus } from "../../entities/Invoice"

export interface InvoiceUpdates {
    amount?: number
    status?: InvoiceStatus
    concept?: string | null
    issue_date?: Date
    due_date?: Date | null
    period_start?: Date | null
    period_end?: Date | null
    id_milestone?: string | null
}

type InvoiceMutableFields = "amount" | "status" | "concept" | "issue_date" | "due_date" | "period_start" | "period_end" | "id_milestone"

export const updateInvoiceUseCase = async (
    invoiceId: string,
    userId: string,
    globalRole: GlobalRole,
    updates: InvoiceUpdates
): Promise<Invoice | null> => {
    const existing = await getInvoiceById(invoiceId)
    if (!existing) {
        throw new Error("Factura no encontrada")
    }

    const role = await getUserRoleInProject(userId, existing.id_project)
    if (globalRole !== "admin" && role !== ProjectRole.PROJECT_MANAGER) {
        throw new Error("Solo un administrador o el project manager puede editar facturas")
    }

    if (updates.amount !== undefined && !(updates.amount > 0)) {
        throw new Error("El monto debe ser mayor a 0")
    }

    // Solo actualizamos los campos provistos (undefined = no tocar).
    const data: Partial<Pick<Invoice, InvoiceMutableFields>> = {}
    if (updates.amount !== undefined) data.amount = updates.amount
    if (updates.status !== undefined) data.status = updates.status
    if (updates.concept !== undefined) data.concept = updates.concept
    if (updates.issue_date !== undefined) data.issue_date = updates.issue_date
    if (updates.due_date !== undefined) data.due_date = updates.due_date
    if (updates.period_start !== undefined) data.period_start = updates.period_start
    if (updates.period_end !== undefined) data.period_end = updates.period_end
    if (updates.id_milestone !== undefined) data.id_milestone = updates.id_milestone

    const updated = await updateInvoice(invoiceId, data)
    if (!updated) {
        throw new Error("No se pudo actualizar la factura")
    }
    return updated
}
