import { createInvoice } from "../../infrastructure/repositories/InvoiceRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { GlobalRole } from "../../entities/User"
import { ProjectRole } from "../../entities/MemberProject"
import { Invoice, InvoiceStatus } from "../../entities/Invoice"
import { ProjectBillingModel } from "../../entities/Project"
import { computeTimeAndMaterialsAmount } from "./ComputeInvoiceAmount"

export interface CreateInvoiceInput {
    // Opcional: si no viene, se auto-calcula para proyectos T&M con periodo definido.
    amount?: number | null
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

    // Resolucion del monto: manual si viene; si no, auto-calculo T&M.
    // El monto se CONGELA al crear (snapshot): no se recalcula despues aunque cambien las
    // horas o las tarifas, para que la factura sea un comprobante estable.
    let amount: number
    if (input.amount !== null && input.amount !== undefined) {
        amount = input.amount
    } else {
        if (project.billing_model !== ProjectBillingModel.TIME_AND_MATERIALS) {
            throw new Error("El monto es obligatorio (el auto-calculo solo aplica a proyectos por tiempo y materiales)")
        }
        if (!input.period_start || !input.period_end) {
            throw new Error("Para auto-calcular una factura T&M se requieren period_start y period_end")
        }
        const computation = await computeTimeAndMaterialsAmount(projectId, input.period_start, input.period_end)
        if (!(computation.total > 0)) {
            throw new Error("No se pudo auto-calcular el monto: no hay horas facturables en el periodo (revisa que los miembros tengan tarifa de venta y horas registradas)")
        }
        amount = computation.total
    }

    if (!(amount > 0)) {
        throw new Error("El monto debe ser mayor a 0")
    }

    return await createInvoice({
        id_project: projectId,
        amount,
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
