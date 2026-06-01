import { getInvoiceById, deleteInvoice } from "../../infrastructure/repositories/InvoiceRepository"
import { getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { GlobalRole } from "../../entities/User"
import { ProjectRole } from "../../entities/MemberProject"

export const deleteInvoiceUseCase = async (
    invoiceId: string,
    userId: string,
    globalRole: GlobalRole
): Promise<{ deleted: boolean }> => {
    const existing = await getInvoiceById(invoiceId)
    if (!existing) {
        throw new Error("Factura no encontrada")
    }

    const role = await getUserRoleInProject(userId, existing.id_project)
    if (globalRole !== "admin" && role !== ProjectRole.PROJECT_MANAGER) {
        throw new Error("Solo un administrador o el project manager puede eliminar facturas")
    }

    const deleted = await deleteInvoice(invoiceId)
    return { deleted }
}
