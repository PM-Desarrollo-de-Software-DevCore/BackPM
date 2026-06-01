import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { getTasksByProject } from "../../infrastructure/repositories/TaskRepository"
import { getProjectMembers } from "../../infrastructure/repositories/MemberProjectRepository"
import { getTimeEntriesByProject } from "../../infrastructure/repositories/TimeEntryRepository"
import { Task, TaskStatus } from "../../entities/Task"
import { computeProjectFinancialSummary } from "./GetProjectFinancialSummary"

const MAX_SERIES_MONTHS = 60
// Horas laborales por mes para convertir un rate mensual a horario (monthly_rate / 160).
const HOURS_PER_MONTH = 160

export type ProgressBasis = "story_points" | "task_count"
export type AcSource = "logged_hours" | "member_rates" | "project_monthly_cost"

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
    acMonthlyCost: number | null // costo mensual (solo para fuentes basadas en tasa mensual)
    acSource: AcSource | null
    loggedHours: number

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
    const timeEntries = await getTimeEntriesByProject(projectId)
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

    // --- Rate mensual por usuario (miembros con rate) para convertir horas a costo ---
    const rateByUser = new Map<string, number>()
    let teamMonthly = 0
    let ratedMembers = 0
    for (const m of members) {
        if (m.monthly_rate !== null) {
            rateByUser.set(m.id_user, m.monthly_rate)
            teamMonthly += m.monthly_rate * (m.fte ?? 1)
            ratedMembers += 1
        }
    }

    // --- Costo por horas registradas (el AC mas real): horas x (monthly_rate / HOURS_PER_MONTH) ---
    const loggedCostByMonth = new Map<number, number>()
    let loggedCostTotal = 0
    let loggedHours = 0
    let ratedEntryCount = 0
    for (const e of timeEntries) {
        loggedHours += e.hours
        const rate = rateByUser.get(e.id_user)
        if (rate === undefined) {
            continue
        }
        const cost = e.hours * (rate / HOURS_PER_MONTH)
        loggedCostTotal += cost
        ratedEntryCount += 1
        const mi = Math.max(0, monthIndexOf(project.start_date, e.work_date))
        loggedCostByMonth.set(mi, (loggedCostByMonth.get(mi) ?? 0) + cost)
    }

    // --- Resolucion del AC: horas registradas > rates de miembros > monthly_cost del proyecto ---
    let acSource: AcSource | null
    let acMonthlyCost: number | null
    let actualCost: number | null
    let acSeriesByMonth: Map<number, number> | null
    if (ratedEntryCount > 0) {
        acSource = "logged_hours"
        acMonthlyCost = null
        actualCost = round2(loggedCostTotal)
        acSeriesByMonth = loggedCostByMonth
    } else if (ratedMembers > 0) {
        acSource = "member_rates"
        acMonthlyCost = round2(teamMonthly)
        actualCost = round2(acMonthlyCost * fin.elapsedMonths)
        acSeriesByMonth = null
    } else if (project.monthly_cost !== null) {
        acSource = "project_monthly_cost"
        acMonthlyCost = project.monthly_cost
        actualCost = round2(acMonthlyCost * fin.elapsedMonths)
        acSeriesByMonth = null
    } else {
        acSource = null
        acMonthlyCost = null
        actualCost = null
        acSeriesByMonth = null
    }

    // --- Metricas EVM a la fecha de estado ---
    const plannedValue = budget !== null && plannedProgressRatio !== null
        ? round2(budget * plannedProgressRatio)
        : null
    const earnedValue = budget !== null && actualProgressRatio !== null
        ? round2(budget * actualProgressRatio)
        : null

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
        acSeriesByMonth,
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
    if (acSource === "logged_hours") {
        notes.push(`AC calculado con horas registradas (time tracking) x (monthly_rate / ${HOURS_PER_MONTH}). Es costo real incurrido: CPI/EAC son confiables en la medida en que el equipo registre sus horas.`)
    } else if (acSource === "member_rates") {
        notes.push("AC estimado con los rates de los miembros (monthly_rate x fte); aun no hay horas registradas. SPI es confiable, pero CPI/EAC son indicativos hasta capturar time tracking.")
    } else if (acSource === "project_monthly_cost") {
        notes.push("AC estimado con el monthly_cost del proyecto (sin rates por miembro ni horas registradas). CPI/EAC son indicativos.")
    } else {
        notes.push("Sin horas registradas, rates de miembros ni monthly_cost: no se puede calcular AC, CPI ni EAC.")
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
        loggedHours: round2(loggedHours),
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
            hasActualCost: actualCost !== null
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
    acSeriesByMonth: Map<number, number> | null
    tasks: Task[]
    measureOf: (task: Task) => number
}

const buildEvmSeries = (input: EvmSeriesInput): EvmPoint[] => {
    const { startDate, budget, plannedDurationMonths, elapsedMonths, totalMeasure, acMonthlyCost, acSeriesByMonth, tasks, measureOf } = input

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
    let cumulativeAc = 0
    for (let i = 0; i <= totalMonths; i++) {
        cumulativeMeasure += measureByMonth.get(i) ?? 0
        if (acSeriesByMonth !== null) {
            cumulativeAc += acSeriesByMonth.get(i) ?? 0
        }
        const monthDate = new Date(Date.UTC(startYear, startMonth + i, 1))
        const isPast = i <= currentMonthIndex

        const pv = budget !== null && plannedDurationMonths !== null && plannedDurationMonths > 0
            ? round2(budget * Math.min(i / plannedDurationMonths, 1))
            : null
        const ev = isPast && budget !== null && totalMeasure > 0
            ? round2(budget * (cumulativeMeasure / totalMeasure))
            : null
        let ac: number | null = null
        if (isPast) {
            if (acSeriesByMonth !== null) {
                ac = round2(cumulativeAc)
            } else if (acMonthlyCost !== null) {
                ac = round2(acMonthlyCost * i)
            }
        }

        series.push({ month: formatMonth(monthDate), pv, ev, ac })
    }

    return series
}
