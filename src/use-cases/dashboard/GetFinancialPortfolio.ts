import { getProjectsByUser } from "../../infrastructure/repositories/ProjectRepository"
import { getTasksByProjects } from "../../infrastructure/repositories/TaskRepository"
import { groupTasksByProject } from "./groupTasksByProject"
import { computeProjectFinancialSummary } from "../projects/GetProjectFinancialSummary"
import { ProjectStatus } from "../../entities/Project"

export interface PortfolioProjectItem {
    id_project: string
    name: string
    status: ProjectStatus
    budget: number | null
    monthlyCost: number | null
    estimatedSpend: number | null
    remainingBudget: number | null
    budgetConsumedRatio: number | null
    runwayMonths: number | null
    budgetCoversPlannedEnd: boolean | null
    projectedOverBudget: number | null
    atRisk: boolean
}

export interface FinancialPortfolioSummary {
    totalProjects: number
    projectsWithBudget: number
    projectsAtRisk: number
    totalBudget: number
    totalEstimatedSpend: number
    totalRemaining: number
    totalProjectedOverBudget: number
}

export interface FinancialPortfolioResponse {
    summary: FinancialPortfolioSummary
    projects: PortfolioProjectItem[]
}

const round2 = (value: number): number => Math.round(value * 100) / 100

// Un proyecto esta "en riesgo" si se proyecta sobre presupuesto o si el presupuesto no cubre la fecha fin.
const isAtRisk = (projectedOverBudget: number | null, budgetCoversPlannedEnd: boolean | null): boolean =>
    (projectedOverBudget !== null && projectedOverBudget > 0) || budgetCoversPlannedEnd === false

export const getFinancialPortfolioUseCase = async (userId: string): Promise<FinancialPortfolioResponse> => {
    const projects = await getProjectsByUser(userId)

    const tasksByProjectId = groupTasksByProject(
        await getTasksByProjects(projects.map((p) => p.id_project))
    )

    const items: PortfolioProjectItem[] = projects.map((project) => {
        const tasks = tasksByProjectId.get(project.id_project) ?? []
        const fin = computeProjectFinancialSummary(project, tasks)
        return {
                id_project: project.id_project,
                name: project.name,
                status: project.status,
                budget: fin.budget,
                monthlyCost: fin.monthlyCost,
                estimatedSpend: fin.estimatedSpend,
                remainingBudget: fin.remainingBudget,
                budgetConsumedRatio: fin.budgetConsumedRatio,
                runwayMonths: fin.runwayMonths,
                budgetCoversPlannedEnd: fin.budgetCoversPlannedEnd,
                projectedOverBudget: fin.projectedOverBudget,
                atRisk: isAtRisk(fin.projectedOverBudget, fin.budgetCoversPlannedEnd)
        }
    })

    const sum = (selector: (item: PortfolioProjectItem) => number | null): number =>
        round2(items.reduce((acc, item) => acc + (selector(item) ?? 0), 0))

    // Totales consistentes a nivel portafolio: remaining = budget - gasto estimado
    // (el gasto desconocido cuenta como 0, asi el remaining de un proyecto sin monthly_cost es su budget).
    const totalBudget = sum((i) => i.budget)
    const totalEstimatedSpend = sum((i) => i.estimatedSpend)

    const summary: FinancialPortfolioSummary = {
        totalProjects: items.length,
        projectsWithBudget: items.filter((i) => i.budget !== null).length,
        projectsAtRisk: items.filter((i) => i.atRisk).length,
        totalBudget,
        totalEstimatedSpend,
        totalRemaining: round2(totalBudget - totalEstimatedSpend),
        totalProjectedOverBudget: sum((i) => i.projectedOverBudget)
    }

    return { summary, projects: items }
}
