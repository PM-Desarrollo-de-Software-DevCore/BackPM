import { AppDataSource } from "../db/DataSource"
import { InvoiceEntity } from "../db/entities/InvoiceEntity"
import { Invoice } from "../../entities/Invoice"

const repo = AppDataSource.getRepository(InvoiceEntity)

type InvoiceMutableFields = "amount" | "status" | "concept" | "issue_date" | "due_date" | "period_start" | "period_end" | "id_milestone"

export const createInvoice = async (data: Omit<Invoice, "id_invoice" | "createdAt">): Promise<Invoice> => {
    const invoice = repo.create(data)
    return await repo.save(invoice)
}

export const getInvoiceById = async (id: string): Promise<Invoice | null> => {
    return await repo.findOne({ where: { id_invoice: id } })
}

export const getInvoicesByProject = async (projectId: string): Promise<Invoice[]> => {
    return await repo.find({ where: { id_project: projectId }, order: { issue_date: "DESC" } })
}

export const updateInvoice = async (
    id: string,
    data: Partial<Pick<Invoice, InvoiceMutableFields>>
): Promise<Invoice | null> => {
    await repo.update({ id_invoice: id }, data)
    return await getInvoiceById(id)
}

export const deleteInvoice = async (id: string): Promise<boolean> => {
    const result = await repo.delete({ id_invoice: id })
    return (result.affected ?? 0) > 0
}
