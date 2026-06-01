import { getExpensesByProject } from "../../infrastructure/repositories/ExpenseRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"

export const getExpensesByProjectUseCase = async (projectId: string, userId: string) => {
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    // Ver gastos: cualquier miembro del proyecto (o su creador).
    const isMember = await isMemberProject(userId, projectId)
    if (!isMember && project.createdBy !== userId) {
        throw new Error("No tienes acceso a este proyecto")
    }

    return await getExpensesByProject(projectId)
}
