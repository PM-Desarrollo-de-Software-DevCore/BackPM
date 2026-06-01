import { createExpense } from "../../infrastructure/repositories/ExpenseRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { GlobalRole } from "../../entities/User"
import { ProjectRole } from "../../entities/MemberProject"
import { Expense, ExpenseCategory } from "../../entities/Expense"

export interface CreateExpenseInput {
    amount: number
    category: ExpenseCategory
    description: string | null
    date: Date
}

export const createExpenseUseCase = async (
    projectId: string,
    userId: string,
    globalRole: GlobalRole,
    input: CreateExpenseInput
): Promise<Expense> => {
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    // Gestionar gastos: admin global o el project manager del proyecto.
    const role = await getUserRoleInProject(userId, projectId)
    if (globalRole !== "admin" && role !== ProjectRole.PROJECT_MANAGER) {
        throw new Error("Solo un administrador o el project manager puede registrar gastos")
    }

    if (!(input.amount > 0)) {
        throw new Error("El monto debe ser mayor a 0")
    }

    return await createExpense({
        id_project: projectId,
        amount: input.amount,
        category: input.category,
        description: input.description ?? null,
        date: input.date,
        createdBy: userId
    })
}
