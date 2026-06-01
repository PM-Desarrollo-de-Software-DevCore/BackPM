import { createInvoice } from "../../infrastructure/repositories/InvoiceRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { GlobalRole } from "../../entities/User"
import { ProjectRole } from "../../entities/MemberProject"
import { Invoice, InvoiceStatus } from "../../entities/Invoice"

export interface CreateInvoiceInput {
    amount: number
    status?: InvoiceStatus
    concept: string | null
    issue_date: Date
    due_date: Date | null
    period_start: Date | null
    period_end: Date | null
    id_milestone: string | null
}

export const createInvoiceUseCase = async (
    projectId: string,
    userId: string,
    globalRole: GlobalRole,
    input: CreateInvoiceInput
): Promise<Invoice> => {
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    // Gestionar facturas: admin global o el project manager del proyecto.
    const role = await getUserRoleInProject(userId, projectId)
    if (globalRole !== "admin" && role !== ProjectRole.PROJECT_MANAGER) {
        throw new Error("Solo un administrador o el project manager puede registrar facturas")
    }

    if (!(input.amount > 0)) {
        throw new Error("El monto debe ser mayor a 0")
    }

    return await createInvoice({
        id_project: projectId,
        amount: input.amount,
        status: input.status ?? InvoiceStatus.DRAFT,
        concept: input.concept ?? null,
        issue_date: input.issue_date,
        due_date: input.due_date ?? null,
        period_start: input.period_start ?? null,
        period_end: input.period_end ?? null,
        id_milestone: input.id_milestone ?? null,
        createdBy: userId
    })
}
