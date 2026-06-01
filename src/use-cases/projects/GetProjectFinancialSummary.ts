import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { getTasksByProject } from "../../infrastructure/repositories/TaskRepository"
import { Task, TaskStatus } from "../../entities/Task"
import { Project, ProjectBillingModel } from "../../entities/Project"

// Mes promedio (365.25 / 12 dias) para las conversiones de tiempo a meses.
const MS_PER_MONTH = 1000 * 60 * 60 * 24 * (365.25 / 12)

// Tope defensivo para no generar series ilimitadas cuando no hay fecha fin.
const MAX_SERIES_MONTHS = 60

export interface FinancialBurnPoint {
    month: string // "YYYY-MM"
    cumulativeEstimatedCost: number
}

export interface ProjectFinancialSummaryResponse {
    // Datos comerciales capturados en el proyecto
    budget: number | null
    monthlyCost: number | null
    billingModel: ProjectBillingModel | null

    // Linea de tiempo
    startDate: Date
    endDate: Date | null
    plannedDurationMonths: number | null
    elapsedMonths: number
    timeProgressRatio: number | null // 0..1 (transcurrido / planeado)

    // Gasto estimado (proxy: costo mensual * meses transcurridos)
    estimatedSpend: number | null
    remainingBudget: number | null
    budgetConsumedRatio: number | null // 0..1+ (gasto estimado / presupuesto)

    // Runway / proyeccion
    runwayMonths: number | null // presupuesto / costo mensual
    projectedBudgetEndDate: Date | null // inicio + runway
    budgetCoversPlannedEnd: boolean | null // runway >= duracion planeada
    projectedOverBudget: number | null // sobrecosto proyectado a la fecha fin (0 si no se pasa)

    // Costos unitarios
    totalStoryPoints: number
    completedStoryPoints: number
    costPerStoryPoint: number | null
    estimatedSprints: number | null
    costPerEstimatedSprint: number | null

    // Serie para la grafica de burn vs presupuesto
    burnSeries: FinancialBurnPoint[]

    // Que se pudo calcular y notas sobre los datos faltantes / supuestos
    dataAvailability: {
        hasBudget: boolean
        hasMonthlyCost: boolean
        hasEndDate: boolean
        hasStoryPoints: boolean
    }
    notes: string[]
}

const round2 = (value: number): number => Math.round(value * 100) / 100

const monthsBetween = (start: Date, end: Date): number =>
    (end.getTime() - start.getTime()) / MS_PER_MONTH

const formatMonth = (date: Date): string => {
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, "0")
    return `${year}-${month}`
}

// Las tareas sin estimar (story_points = null) cuentan como 0 puntos.
const pointsOf = (task: Task): number => task.story_points ?? 0

// Serie de gasto acumulado mes a mes, lista para graficar contra la linea de presupuesto.
const buildBurnSeries = (
    startDate: Date,
    endDate: Date | null,
    monthlyCost: number | null,
    runwayMonths: number | null
): FinancialBurnPoint[] => {
    if (monthlyCost === null) {
        return []
    }

    // Horizonte: fecha fin planeada; si no hay, hasta donde alcance el presupuesto.
    let horizonMonths: number
    if (endDate !== null) {
        horizonMonths = monthsBetween(startDate, endDate)
    } else if (runwayMonths !== null) {
        horizonMonths = runwayMonths
    } else {
        return []
    }

    const totalMonths = Math.min(Math.max(Math.ceil(horizonMonths), 1), MAX_SERIES_MONTHS)

    // Anclamos cada punto al dia 1 del mes (Date.UTC maneja el desborde de mes/anio)
    // para que la serie no se salte meses cuando el dia de inicio es 29-31.
    const startYear = startDate.getUTCFullYear()
    const startMonth = startDate.getUTCMonth()

    const series: FinancialBurnPoint[] = []
    for (let i = 0; i <= totalMonths; i++) {
        const pointDate = new Date(Date.UTC(startYear, startMonth + i, 1))
        series.push({
            month: formatMonth(pointDate),
            cumulativeEstimatedCost: round2(monthlyCost * i)
        })
    }

    return series
}

export const getProjectFinancialSummaryUseCase = async (
    projectId: string,
    userId: string
): Promise<ProjectFinancialSummaryResponse> => {
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    const isMember = await isMemberProject(userId, projectId)
    if (!isMember && project.createdBy !== userId) {
        throw new Error("No tienes acceso a este proyecto")
    }

    const tasks = await getTasksByProject(projectId)

    return computeProjectFinancialSummary(project, tasks)
}

// Logica pura del resumen financiero, reutilizable sin acceso a BD (p.ej. en el reporte PDF).
export const computeProjectFinancialSummary = (
    project: Project,
    tasks: Task[]
): ProjectFinancialSummaryResponse => {
    const now = new Date()

    const { billing_model: billingModel, start_date: startDate, end_date: endDate, estimated_sprints: estimatedSprints } = project

    // Normalizamos a number | null: un presupuesto o costo <= 0 no es util para los calculos.
    const budget = project.budget !== null && project.budget > 0 ? project.budget : null
    const monthlyCost = project.monthly_cost !== null && project.monthly_cost > 0 ? project.monthly_cost : null

    // --- Linea de tiempo ---
    const plannedDurationMonths = endDate !== null ? Math.max(0, round2(monthsBetween(startDate, endDate))) : null
    const elapsedMonths = Math.max(0, round2(monthsBetween(startDate, now)))
    const timeProgressRatio = plannedDurationMonths !== null && plannedDurationMonths > 0
        ? round2(Math.min(elapsedMonths / plannedDurationMonths, 1))
        : null

    // --- Gasto estimado (proxy) ---
    // No hay captura de costo real; se estima como costo mensual * meses transcurridos.
    const estimatedSpend = monthlyCost !== null ? round2(monthlyCost * elapsedMonths) : null
    const remainingBudget = budget !== null && estimatedSpend !== null ? round2(budget - estimatedSpend) : null
    const budgetConsumedRatio = budget !== null && estimatedSpend !== null ? round2(estimatedSpend / budget) : null

    // --- Runway / proyeccion ---
    const runwayMonths = budget !== null && monthlyCost !== null ? round2(budget / monthlyCost) : null
    const projectedBudgetEndDate = runwayMonths !== null
        ? new Date(startDate.getTime() + runwayMonths * MS_PER_MONTH)
        : null
    const budgetCoversPlannedEnd = runwayMonths !== null && plannedDurationMonths !== null
        ? runwayMonths >= plannedDurationMonths
        : null
    // Gasto proyectado a la fecha fin planeada vs presupuesto (sobrecosto si es positivo).
    const projectedOverBudget = budget !== null && monthlyCost !== null && plannedDurationMonths !== null
        ? round2(Math.max(0, monthlyCost * plannedDurationMonths - budget))
        : null

    // --- Costos unitarios ---
    const totalStoryPoints = tasks.reduce((acc, t) => acc + pointsOf(t), 0)
    const completedStoryPoints = tasks
        .filter((t) => t.status === TaskStatus.COMPLETED)
        .reduce((acc, t) => acc + pointsOf(t), 0)
    const costPerStoryPoint = budget !== null && totalStoryPoints > 0 ? round2(budget / totalStoryPoints) : null
    const costPerEstimatedSprint = budget !== null && estimatedSprints !== null && estimatedSprints > 0
        ? round2(budget / estimatedSprints)
        : null

    // --- Serie de burn ---
    const burnSeries = buildBurnSeries(startDate, endDate, monthlyCost, runwayMonths)

    // --- Notas sobre datos faltantes y supuestos ---
    const notes: string[] = []
    if (budget === null) {
        notes.push("El proyecto no tiene presupuesto (budget) definido; no se pueden calcular consumo, runway ni costos unitarios.")
    }
    if (monthlyCost === null) {
        notes.push("El proyecto no tiene costo mensual (monthly_cost) definido; no se puede estimar el gasto ni la serie de burn.")
    }
    if (endDate === null) {
        notes.push("El proyecto no tiene fecha fin (end_date); no se puede calcular la duracion planeada ni el avance temporal.")
    }
    if (totalStoryPoints === 0) {
        notes.push("El proyecto no tiene story points estimados; no se puede calcular el costo por story point.")
    }
    if (monthlyCost !== null) {
        notes.push("El gasto es una estimacion: asume un costo mensual constante desde el inicio hasta hoy (no hay captura de costo real).")
    }

    return {
        budget,
        monthlyCost,
        billingModel,
        startDate,
        endDate,
        plannedDurationMonths,
        elapsedMonths,
        timeProgressRatio,
        estimatedSpend,
        remainingBudget,
        budgetConsumedRatio,
        runwayMonths,
        projectedBudgetEndDate,
        budgetCoversPlannedEnd,
        projectedOverBudget,
        totalStoryPoints,
        completedStoryPoints,
        costPerStoryPoint,
        estimatedSprints,
        costPerEstimatedSprint,
        burnSeries,
        dataAvailability: {
            hasBudget: budget !== null,
            hasMonthlyCost: monthlyCost !== null,
            hasEndDate: endDate !== null,
            hasStoryPoints: totalStoryPoints > 0
        },
        notes
    }
}
