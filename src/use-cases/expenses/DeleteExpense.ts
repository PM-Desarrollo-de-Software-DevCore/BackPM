import { getExpenseById, deleteExpense } from "../../infrastructure/repositories/ExpenseRepository"
import { getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { GlobalRole } from "../../entities/User"
import { ProjectRole } from "../../entities/MemberProject"

export const deleteExpenseUseCase = async (
    expenseId: string,
    userId: string,
    globalRole: GlobalRole
): Promise<{ deleted: boolean }> => {
    const existing = await getExpenseById(expenseId)
    if (!existing) {
        throw new Error("Gasto no encontrado")
    }

    const role = await getUserRoleInProject(userId, existing.id_project)
    if (globalRole !== "admin" && role !== ProjectRole.PROJECT_MANAGER) {
        throw new Error("Solo un administrador o el project manager puede eliminar gastos")
    }

    const deleted = await deleteExpense(expenseId)
    return { deleted }
}
