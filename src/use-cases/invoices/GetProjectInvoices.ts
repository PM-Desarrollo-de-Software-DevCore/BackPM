import { getInvoicesByProject } from "../../infrastructure/repositories/InvoiceRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { Invoice, InvoiceStatus } from "../../entities/Invoice"

export interface BillingSummary {
    invoiceCount: number
    totalDraft: number
    totalBilled: number // emitidas (sent + paid)
    totalPaid: number
    totalOutstanding: number // emitidas no pagadas (sent)
    budget: number | null
    billedVsBudgetRatio: number | null
}

export interface ProjectInvoicesResponse {
    summary: BillingSummary
    invoices: Invoice[]
}

const round2 = (value: number): number => Math.round(value * 100) / 100

export const getProjectInvoicesUseCase = async (
    projectId: string,
    userId: string
): Promise<ProjectInvoicesResponse> => {
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    // Ver facturas: cualquier miembro del proyecto (o su creador).
    const isMember = await isMemberProject(userId, projectId)
    if (!isMember && project.createdBy !== userId) {
        throw new Error("No tienes acceso a este proyecto")
    }

    const invoices = await getInvoicesByProject(projectId)
    const sumWhere = (predicate: (i: Invoice) => boolean): number =>
        round2(invoices.filter(predicate).reduce((acc, i) => acc + i.amount, 0))

    const totalBilled = sumWhere((i) => i.status === InvoiceStatus.SENT || i.status === InvoiceStatus.PAID)
    const budget = project.budget

    const summary: BillingSummary = {
        invoiceCount: invoices.length,
        totalDraft: sumWhere((i) => i.status === InvoiceStatus.DRAFT),
        totalBilled,
        totalPaid: sumWhere((i) => i.status === InvoiceStatus.PAID),
        totalOutstanding: sumWhere((i) => i.status === InvoiceStatus.SENT),
        budget,
        billedVsBudgetRatio: budget !== null && budget > 0 ? round2(totalBilled / budget) : null
    }

    return { summary, invoices }
}
