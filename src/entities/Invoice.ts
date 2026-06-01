export enum InvoiceStatus {
    DRAFT = "draft",
    SENT = "sent",
    PAID = "paid"
}

export interface Invoice {
    id_invoice: string,
    id_project: string,
    amount: number,
    status: InvoiceStatus,
    concept: string | null,
    issue_date: Date,
    due_date: Date | null,
    // Contexto segun billing_model: hito para fixed_price, periodo para time_and_materials/retainer.
    period_start: Date | null,
    period_end: Date | null,
    id_milestone: string | null,
    createdBy: string,
    createdAt: Date
}
