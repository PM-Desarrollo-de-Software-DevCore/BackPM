export enum ExpenseCategory {
    SOFTWARE = "software",
    INFRASTRUCTURE = "infrastructure",
    SERVICES = "services",
    TRAVEL = "travel",
    OTHER = "other"
}

export interface Expense {
    id_expense: string,
    id_project: string,
    amount: number,
    category: ExpenseCategory,
    description: string | null,
    date: Date,
    createdBy: string,
    createdAt: Date
}
