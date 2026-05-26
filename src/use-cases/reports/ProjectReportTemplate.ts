import { Project } from "../../entities/Project"
import { Sprint } from "../../entities/Sprint"
import { Task } from "../../entities/Task"

export interface ProjectReportStats {
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    pendingTasks: number
    overdueTasks: number
    averageProgress: number
    totalSprints: number
    activeSprints: number
    finishedSprints: number
    plannedSprints: number
}

export interface ProjectReportContext {
    project: {
        id: string
        name: string
        description: string | null
        client: string
        projectType: string
        methodology: string
        priority: string
        status: string
        startDate: string
        endDate: string | null
    }
    stats: ProjectReportStats
    taskBreakdown: Array<{ label: string; value: number }>
    sprintBreakdown: Array<{ label: string; value: number }>
    upcomingTasks: Array<{ title: string; status: string; endDate: string | null; progress: number }>
    sprints: Array<{ name: string; status: string; startDate: string; endDate: string }>
}

export interface ProjectReportInsights {
    title: string
    executiveSummary: string
    highlights: string[]
    risks: string[]
    recommendations: string[]
    nextSteps: string[]
}

const formatList = (items: string[]) => items.length > 0 ? items.map((item) => `<li>${item}</li>`).join("") : "<li>No data available</li>"

export const buildProjectReportHtmlTemplate = (context: ProjectReportContext, insights: ProjectReportInsights) => {
    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 24px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 18px; margin-bottom: 18px; }
            .title { font-size: 28px; font-weight: 700; margin: 0; }
            .subtitle { color: #64748b; margin-top: 6px; font-size: 14px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 18px 0; }
            .card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 14px; background: #f8fafc; }
            .card h3 { margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: .08em; color: #475569; }
            .card p { margin: 0; font-size: 15px; }
            .section { margin-top: 22px; }
            .section h2 { margin: 0 0 10px; font-size: 18px; }
            ul { margin: 8px 0 0 20px; padding: 0; }
            li { margin: 4px 0; }
            .muted { color: #64748b; }
            .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">${insights.title}</h1>
              <p class="subtitle">${context.project.client} · ${context.project.methodology.toUpperCase()} · ${context.project.status}</p>
            </div>
            <div class="muted">Generated for project ${context.project.name}</div>
          </div>

          <div class="grid">
            <div class="card"><h3>Total Tasks</h3><p>${context.stats.totalTasks}</p></div>
            <div class="card"><h3>Completed</h3><p>${context.stats.completedTasks}</p></div>
            <div class="card"><h3>Average Progress</h3><p>${context.stats.averageProgress}%</p></div>
          </div>

          <div class="two-col">
            <div class="section">
              <h2>Executive Summary</h2>
              <p>${insights.executiveSummary}</p>
            </div>
            <div class="section">
              <h2>Highlights</h2>
              <ul>${formatList(insights.highlights)}</ul>
            </div>
          </div>

          <div class="two-col section">
            <div>
              <h2>Risks</h2>
              <ul>${formatList(insights.risks)}</ul>
            </div>
            <div>
              <h2>Recommendations</h2>
              <ul>${formatList(insights.recommendations)}</ul>
            </div>
          </div>

          <div class="section">
            <h2>Next Steps</h2>
            <ul>${formatList(insights.nextSteps)}</ul>
          </div>
        </body>
      </html>
    `
}

export const buildProjectReportContext = (
    project: Project,
    tasks: Task[],
    sprints: Sprint[]
): ProjectReportContext => {
    const now = new Date()
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((task) => task.status === "completed").length
    const inProgressTasks = tasks.filter((task) => task.status === "in_progress").length
    const pendingTasks = tasks.filter((task) => task.status === "pending").length
    const overdueTasks = tasks.filter((task) => task.end_date && task.status !== "completed" && task.end_date.getTime() < now.getTime()).length
    const averageProgress = totalTasks > 0
        ? Math.round(tasks.reduce((total, task) => total + (task.progress ?? 0), 0) / totalTasks)
        : 0

    const activeSprints = sprints.filter((sprint) => sprint.status === "active").length
    const finishedSprints = sprints.filter((sprint) => sprint.status === "finished").length
    const plannedSprints = sprints.filter((sprint) => sprint.status === "planned").length

    return {
        project: {
            id: project.id_project,
            name: project.name,
            description: project.description,
            client: project.client,
            projectType: project.project_type,
            methodology: project.methodology,
            priority: project.priority,
            status: project.status,
            startDate: project.start_date.toISOString(),
            endDate: project.end_date ? project.end_date.toISOString() : null,
        },
        stats: {
            totalTasks,
            completedTasks,
            inProgressTasks,
            pendingTasks,
            overdueTasks,
            averageProgress,
            totalSprints: sprints.length,
            activeSprints,
            finishedSprints,
            plannedSprints,
        },
        taskBreakdown: [
            { label: "Completed", value: completedTasks },
            { label: "In progress", value: inProgressTasks },
            { label: "Pending", value: pendingTasks },
            { label: "Overdue", value: overdueTasks },
        ],
        sprintBreakdown: [
            { label: "Active", value: activeSprints },
            { label: "Finished", value: finishedSprints },
            { label: "Planned", value: plannedSprints },
        ],
        upcomingTasks: tasks
            .filter((task) => task.end_date)
            .sort((a, b) => (a.end_date?.getTime() ?? 0) - (b.end_date?.getTime() ?? 0))
            .slice(0, 5)
            .map((task) => ({
                title: task.title,
                status: task.status,
                endDate: task.end_date ? task.end_date.toISOString() : null,
                progress: task.progress,
            })),
        sprints: [...sprints]
            .sort((a, b) => a.start_date.getTime() - b.start_date.getTime())
            .slice(0, 5)
            .map((sprint) => ({
                name: sprint.name,
                status: sprint.status,
                startDate: sprint.start_date.toISOString(),
                endDate: sprint.end_date.toISOString(),
            })),
    }
}