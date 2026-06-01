import { getExpenseById, updateExpense } from "../../infrastructure/repositories/ExpenseRepository"
import { getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { GlobalRole } from "../../entities/User"
import { ProjectRole } from "../../entities/MemberProject"
import { Expense, ExpenseCategory } from "../../entities/Expense"

export interface ExpenseUpdates {
    amount?: number
    category?: ExpenseCategory
    description?: string | null
    date?: Date
}

export const updateExpenseUseCase = async (
    expenseId: string,
    userId: string,
    globalRole: GlobalRole,
    updates: ExpenseUpdates
): Promise<Expense | null> => {
    const existing = await getExpenseById(expenseId)
    if (!existing) {
        throw new Error("Gasto no encontrado")
    }

    const role = await getUserRoleInProject(userId, existing.id_project)
    if (globalRole !== "admin" && role !== ProjectRole.PROJECT_MANAGER) {
        throw new Error("Solo un administrador o el project manager puede editar gastos")
    }

    if (updates.amount !== undefined && !(updates.amount > 0)) {
        throw new Error("El monto debe ser mayor a 0")
    }

    // Solo actualizamos los campos provistos (undefined = no tocar).
    const data: Partial<Pick<Expense, "amount" | "category" | "description" | "date">> = {}
    if (updates.amount !== undefined) data.amount = updates.amount
    if (updates.category !== undefined) data.category = updates.category
    if (updates.description !== undefined) data.description = updates.description
    if (updates.date !== undefined) data.date = updates.date

    const updated = await updateExpense(expenseId, data)
    if (!updated) {
        throw new Error("No se pudo actualizar el gasto")
    }
    return updated
}
