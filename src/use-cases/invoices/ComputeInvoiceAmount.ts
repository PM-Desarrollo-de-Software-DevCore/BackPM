import { getTimeEntriesByProjectAndPeriod } from "../../infrastructure/repositories/TimeEntryRepository"
import { getProjectMembers, getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { GlobalRole } from "../../entities/User"
import { ProjectRole } from "../../entities/MemberProject"

export interface TimeAndMaterialsLine {
    userId: string
    hours: number
    sale_rate: number | null
    subtotal: number
}

export interface TimeAndMaterialsComputation {
    lines: TimeAndMaterialsLine[]
    total: number
    membersMissingRate: string[]
}

// Auto-calcula el monto de una factura T&M para un periodo: por cada miembro, suma de
// horas registradas en [start, end] x su sale_rate. Los miembros con horas pero SIN
// sale_rate cuentan 0 (no facturables) y se reportan en membersMissingRate para avisar.
// Usa el repo CRUDO de miembros (con la tarifa real); el enmascarado por permisos vive
// en la capa que expone esto, no aqui (aqui se necesita la tarifa para calcular).
export const computeTimeAndMaterialsAmount = async (
    projectId: string,
    start: Date,
    end: Date
): Promise<TimeAndMaterialsComputation> => {
    const entries = await getTimeEntriesByProjectAndPeriod(projectId, start, end)

    const hoursByUser = new Map<string, number>()
    for (const entry of entries) {
        hoursByUser.set(entry.id_user, (hoursByUser.get(entry.id_user) ?? 0) + entry.hours)
    }

    const members = await getProjectMembers(projectId)
    const rateByUser = new Map(members.map((member) => [member.id_user, member.sale_rate]))

    const lines: TimeAndMaterialsLine[] = []
    const membersMissingRate: string[] = []
    let total = 0
    for (const [userId, hours] of hoursByUser) {
        const sale_rate = rateByUser.get(userId) ?? null
        const subtotal = hours * (sale_rate ?? 0)
        lines.push({ userId, hours, sale_rate, subtotal })
        total += subtotal
        if (sale_rate === null && hours > 0) {
            membersMissingRate.push(userId)
        }
    }
    // Redondeo monetario a 2 decimales.
    total = Math.round(total * 100) / 100
    return { lines, total, membersMissingRate }
}

// Preview para el front: valida acceso (admin o PM del proyecto) y devuelve el calculo
// sugerido de un periodo SIN crear la factura. La tarifa solo la ven admin/PM, por eso
// el gating aqui es el mismo que para gestionar facturas.
export const getSuggestedInvoiceAmountUseCase = async (
    projectId: string,
    userId: string,
    globalRole: GlobalRole,
    start: Date,
    end: Date
): Promise<TimeAndMaterialsComputation> => {
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    const role = await getUserRoleInProject(userId, projectId)
    if (globalRole !== "admin" && role !== ProjectRole.PROJECT_MANAGER) {
        throw new Error("Solo un administrador o el project manager puede ver el monto sugerido")
    }

    return await computeTimeAndMaterialsAmount(projectId, start, end)
}
