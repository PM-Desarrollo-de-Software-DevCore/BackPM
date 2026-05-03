import { getProjectsByUser } from "../../infrastructure/repositories/ProjectRepository"
import { getTasksByProject } from "../../infrastructure/repositories/TaskRepository"
import { Project, ProjectPriority, ProjectStatus } from "../../entities/Project"
import { Task, TaskStatus } from "../../entities/Task"

export interface ProjectChartItem {
    id_project: string
    name: string
    status: ProjectStatus
    priority: ProjectPriority
    start_date: Date
    end_date: Date | null
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    pendingTasks: number
    completionPercentage: number
    isOverdue: boolean
    daysRemaining: number | null
}

export interface ProjectsStatsSummary {
    totalProjects: number
    planningProjects: number
    inProgressProjects: number
    completedProjects: number
    overdueProjects: number
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    pendingTasks: number
}

export interface ProjectsStatsResponse {
    summary: ProjectsStatsSummary
    projectsByStatus: { status: ProjectStatus; count: number }[]
    projectsByPriority: { priority: ProjectPriority; count: number }[]
    projectsChart: ProjectChartItem[]
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

const buildChartItem = (project: Project, tasks: Task[], today: Date): ProjectChartItem => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length
    const inProgressTasks = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length
    const pendingTasks = tasks.filter((t) => t.status === TaskStatus.PENDING).length

    const completionPercentage = totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100)

    const endDate = project.end_date
    const isOverdue = endDate !== null
        && endDate.getTime() < today.getTime()
        && project.status !== ProjectStatus.COMPLETED

    const daysRemaining = endDate === null
        ? null
        : Math.ceil((endDate.getTime() - today.getTime()) / MS_PER_DAY)

    return {
        id_project: project.id_project,
        name: project.name,
        status: project.status,
        priority: project.priority,
        start_date: project.start_date,
        end_date: endDate,
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        completionPercentage,
        isOverdue,
        daysRemaining
    }
}

const countBy = <T extends string>(items: { key: T }[], values: T[]): { key: T; count: number }[] =>
    values.map((value) => ({
        key: value,
        count: items.filter((item) => item.key === value).length
    }))

export const getProjectsStatsUseCase = async (userId: string): Promise<ProjectsStatsResponse> => {
    const projects = await getProjectsByUser(userId)

    const today = new Date()

    const projectsChart: ProjectChartItem[] = await Promise.all(
        projects.map(async (project) => {
            const tasks = await getTasksByProject(project.id_project)
            return buildChartItem(project, tasks, today)
        })
    )

    const summary: ProjectsStatsSummary = {
        totalProjects: projects.length,
        planningProjects: projects.filter((p) => p.status === ProjectStatus.PLANNING).length,
        inProgressProjects: projects.filter((p) => p.status === ProjectStatus.IN_PROGRESS).length,
        completedProjects: projects.filter((p) => p.status === ProjectStatus.COMPLETED).length,
        overdueProjects: projectsChart.filter((p) => p.isOverdue).length,
        totalTasks: projectsChart.reduce((acc, p) => acc + p.totalTasks, 0),
        completedTasks: projectsChart.reduce((acc, p) => acc + p.completedTasks, 0),
        inProgressTasks: projectsChart.reduce((acc, p) => acc + p.inProgressTasks, 0),
        pendingTasks: projectsChart.reduce((acc, p) => acc + p.pendingTasks, 0)
    }

    const statusItems = projects.map((p) => ({ key: p.status }))
    const priorityItems = projects.map((p) => ({ key: p.priority }))

    const projectsByStatus = countBy(statusItems, [
        ProjectStatus.PLANNING,
        ProjectStatus.IN_PROGRESS,
        ProjectStatus.COMPLETED
    ]).map(({ key, count }) => ({ status: key, count }))

    const projectsByPriority = countBy(priorityItems, [
        ProjectPriority.HIGH,
        ProjectPriority.MEDIUM,
        ProjectPriority.LOW
    ]).map(({ key, count }) => ({ priority: key, count }))

    return {
        summary,
        projectsByStatus,
        projectsByPriority,
        projectsChart
    }
}
