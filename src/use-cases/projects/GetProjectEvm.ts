import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { getTasksByProject } from "../../infrastructure/repositories/TaskRepository"
import { getProjectMembers } from "../../infrastructure/repositories/MemberProjectRepository"
import { Task, TaskStatus } from "../../entities/Task"
import { computeProjectFinancialSummary } from "./GetProjectFinancialSummary"

const MAX_SERIES_MONTHS = 60

export type ProgressBasis = "story_points" | "task_count"
export type AcSource = "member_rates" | "project_monthly_cost"

export interface EvmPoint {
    month: string // "YYYY-MM"
    pv: number | null // Planned Value acumulado
    ev: number | null // Earned Value acumulado (null en meses futuros)
    ac: number | null // Actual Cost acumulado (null en meses futuros)
}

export interface ProjectEvmResponse {
    budget: number | null // BAC (Budget At Completion)
    statusDate: Date

    // Insumos
    plannedDurationMonths: number | null
    elapsedMonths: number
    plannedProgressRatio: number | null // % de cronograma planeado a la fecha (base de PV)
    actualProgressRatio: number | null // % completado real (base de EV)
    progressBasis: ProgressBasis | null
    totalStoryPoints: number
    completedStoryPoints: number

    // Costo para AC
    acMonthlyCost: number | null
    acSource: AcSource | null

    // Metricas EVM a la fecha de estado
    plannedValue: number | null // PV
    earnedValue: number | null // EV
    actualCost: number | null // AC
    scheduleVariance: number | null // SV = EV - PV
    costVariance: number | null // CV = EV - AC
    schedulePerformanceIndex: number | null // SPI = EV / PV
    costPerformanceIndex: number | null // CPI = EV / AC
    estimateAtCompletion: number | null // EAC = BAC / CPI
    varianceAtCompletion: number | null // VAC = BAC - EAC

    series: EvmPoint[]

    dataAvailability: {
        hasBudget: boolean
        hasSchedule: boolean
        hasProgressMeasure: boolean
        hasActualCost: boolean
    }
    notes: string[]
}

const round2 = (value: number): number => Math.round(value * 100) / 100

// Indice de mes calendario relativo al inicio (alineado con las etiquetas de la serie).
const monthIndexOf = (start: Date, date: Date): number =>
    (date.getUTCFullYear() - start.getUTCFullYear()) * 12 + (date.getUTCMonth() - start.getUTCMonth())

const formatMonth = (date: Date): string => {
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, "0")
    return `${year}-${month}`
}

export const getProjectEvmUseCase = async (
    projectId: string,
    userId: string
): Promise<ProjectEvmResponse> => {
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    const isMember = await isMemberProject(userId, projectId)
    if (!isMember && project.createdBy !== userId) {
        throw new Error("No tienes acceso a este proyecto")
    }

    const tasks = await getTasksByProject(projectId)
    const members = await getProjectMembers(projectId)
    const now = new Date()

    // Reutilizamos el calculo financiero ya probado (budget, meses, story points).
    const fin = computeProjectFinancialSummary(project, tasks)
    const budget = fin.budget

    // --- Medida de avance: story points si hay, si no conteo de tareas ---
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length

    let progressBasis: ProgressBasis | null
    let totalMeasure: number
    let completedMeasure: number
    let measureOf: (task: Task) => number

    if (fin.totalStoryPoints > 0) {
        progressBasis = "story_points"
        totalMeasure = fin.totalStoryPoints
        completedMeasure = fin.completedStoryPoints
        measureOf = (task) => task.story_points ?? 0
    } else if (totalTasks > 0) {
        progressBasis = "task_count"
        totalMeasure = totalTasks
        completedMeasure = completedTasks
        measureOf = () => 1
    } else {
        progressBasis = null
        totalMeasure = 0
        completedMeasure = 0
        measureOf = () => 0
    }

    const actualProgressRatio = totalMeasure > 0 ? round2(completedMeasure / totalMeasure) : null
    const plannedProgressRatio = fin.timeProgressRatio

    // --- Costo mensual para el AC: preferir rates de miembros (PM-141) ---
    let teamMonthly = 0
    let ratedMembers = 0
    for (const m of members) {
        if (m.monthly_rate !== null) {
            teamMonthly += m.monthly_rate * (m.fte ?? 1)
            ratedMembers += 1
        }
    }

    let acMonthlyCost: number | null
    let acSource: AcSource | null
    if (ratedMembers > 0) {
        acMonthlyCost = round2(teamMonthly)
        acSource = "member_rates"
    } else if (project.monthly_cost !== null) {
        acMonthlyCost = project.monthly_cost
        acSource = "project_monthly_cost"
    } else {
        acMonthlyCost = null
        acSource = null
    }

    // --- Metricas EVM a la fecha de estado ---
    const plannedValue = budget !== null && plannedProgressRatio !== null
        ? round2(budget * plannedProgressRatio)
        : null
    const earnedValue = budget !== null && actualProgressRatio !== null
        ? round2(budget * actualProgressRatio)
        : null
    const actualCost = acMonthlyCost !== null ? round2(acMonthlyCost * fin.elapsedMonths) : null

    const scheduleVariance = earnedValue !== null && plannedValue !== null ? round2(earnedValue - plannedValue) : null
    const costVariance = earnedValue !== null && actualCost !== null ? round2(earnedValue - actualCost) : null
    const schedulePerformanceIndex = earnedValue !== null && plannedValue !== null && plannedValue > 0
        ? round2(earnedValue / plannedValue)
        : null
    const costPerformanceIndex = earnedValue !== null && actualCost !== null && actualCost > 0
        ? round2(earnedValue / actualCost)
        : null
    const estimateAtCompletion = budget !== null && costPerformanceIndex !== null && costPerformanceIndex > 0
        ? round2(budget / costPerformanceIndex)
        : null
    const varianceAtCompletion = budget !== null && estimateAtCompletion !== null
        ? round2(budget - estimateAtCompletion)
        : null

    // --- Serie S-curve (PV/EV/AC mes a mes) ---
    const series = buildEvmSeries({
        startDate: project.start_date,
        budget,
        plannedDurationMonths: fin.plannedDurationMonths,
        elapsedMonths: fin.elapsedMonths,
        totalMeasure,
        acMonthlyCost,
        tasks,
        measureOf
    })

    // --- Notas / supuestos ---
    const notes: string[] = []
    if (budget === null) {
        notes.push("El proyecto no tiene presupuesto (budget); PV, EV y los indices no se pueden calcular.")
    }
    if (fin.plannedDurationMonths === null) {
        notes.push("El proyecto no tiene fecha fin; no se puede calcular PV ni SPI.")
    }
    if (progressBasis === null) {
        notes.push("El proyecto no tiene tareas; no hay medida de avance para EV.")
    } else if (progressBasis === "task_count") {
        notes.push("Sin story points: el avance (EV) se mide por conteo de tareas completadas.")
    }
    if (acSource === "member_rates") {
        notes.push("AC estimado con los rates de los miembros (monthly_rate x fte). Es costo planeado, no incurrido real: SPI es confiable, pero CPI/EAC son indicativos hasta tener time tracking.")
    } else if (acSource === "project_monthly_cost") {
        notes.push("AC estimado con el monthly_cost del proyecto (ningun miembro tiene rate). CPI/EAC son indicativos hasta tener rates por miembro o time tracking.")
    } else {
        notes.push("Sin rates de miembros ni monthly_cost: no se puede calcular AC, CPI ni EAC.")
    }

    return {
        budget,
        statusDate: now,
        plannedDurationMonths: fin.plannedDurationMonths,
        elapsedMonths: fin.elapsedMonths,
        plannedProgressRatio,
        actualProgressRatio,
        progressBasis,
        totalStoryPoints: fin.totalStoryPoints,
        completedStoryPoints: fin.completedStoryPoints,
        acMonthlyCost,
        acSource,
        plannedValue,
        earnedValue,
        actualCost,
        scheduleVariance,
        costVariance,
        schedulePerformanceIndex,
        costPerformanceIndex,
        estimateAtCompletion,
        varianceAtCompletion,
        series,
        dataAvailability: {
            hasBudget: budget !== null,
            hasSchedule: fin.plannedDurationMonths !== null,
            hasProgressMeasure: progressBasis !== null,
            hasActualCost: acMonthlyCost !== null
        },
        notes
    }
}

interface EvmSeriesInput {
    startDate: Date
    budget: number | null
    plannedDurationMonths: number | null
    elapsedMonths: number
    totalMeasure: number
    acMonthlyCost: number | null
    tasks: Task[]
    measureOf: (task: Task) => number
}

const buildEvmSeries = (input: EvmSeriesInput): EvmPoint[] => {
    const { startDate, budget, plannedDurationMonths, elapsedMonths, totalMeasure, acMonthlyCost, tasks, measureOf } = input

    // Horizonte: duracion planeada; si no hay, hasta hoy.
    const horizon = plannedDurationMonths ?? elapsedMonths
    const totalMonths = Math.min(Math.max(Math.ceil(horizon), 1), MAX_SERIES_MONTHS)
    const currentMonthIndex = Math.floor(elapsedMonths)

    // Medida ganada por indice de mes (segun completedAt).
    const measureByMonth = new Map<number, number>()
    for (const task of tasks) {
        if (task.status === TaskStatus.COMPLETED && task.completedAt) {
            const mi = Math.max(0, monthIndexOf(startDate, task.completedAt))
            measureByMonth.set(mi, (measureByMonth.get(mi) ?? 0) + measureOf(task))
        }
    }

    const startYear = startDate.getUTCFullYear()
    const startMonth = startDate.getUTCMonth()

    const series: EvmPoint[] = []
    let cumulativeMeasure = 0
    for (let i = 0; i <= totalMonths; i++) {
        cumulativeMeasure += measureByMonth.get(i) ?? 0
        const monthDate = new Date(Date.UTC(startYear, startMonth + i, 1))
        const isPast = i <= currentMonthIndex

        const pv = budget !== null && plannedDurationMonths !== null && plannedDurationMonths > 0
            ? round2(budget * Math.min(i / plannedDurationMonths, 1))
            : null
        const ev = isPast && budget !== null && totalMeasure > 0
            ? round2(budget * (cumulativeMeasure / totalMeasure))
            : null
        const ac = isPast && acMonthlyCost !== null
            ? round2(acMonthlyCost * i)
            : null

        series.push({ month: formatMonth(monthDate), pv, ev, ac })
    }

    return series
}
