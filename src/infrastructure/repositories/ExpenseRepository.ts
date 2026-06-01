import { AppDataSource } from "../db/DataSource"
import { ExpenseEntity } from "../db/entities/ExpenseEntity"
import { Expense } from "../../entities/Expense"

const repo = AppDataSource.getRepository(ExpenseEntity)

export const createExpense = async (data: Omit<Expense, "id_expense" | "createdAt">): Promise<Expense> => {
    const expense = repo.create(data)
    return await repo.save(expense)
}

export const getExpenseById = async (id: string): Promise<Expense | null> => {
    return await repo.findOne({ where: { id_expense: id } })
}

export const getExpensesByProject = async (projectId: string): Promise<Expense[]> => {
    return await repo.find({ where: { id_project: projectId }, order: { date: "DESC" } })
}

export const updateExpense = async (
    id: string,
    data: Partial<Pick<Expense, "amount" | "category" | "description" | "date">>
): Promise<Expense | null> => {
    await repo.update({ id_expense: id }, data)
    return await getExpenseById(id)
}

export const deleteExpense = async (id: string): Promise<boolean> => {
    const result = await repo.delete({ id_expense: id })
    return (result.affected ?? 0) > 0
}
