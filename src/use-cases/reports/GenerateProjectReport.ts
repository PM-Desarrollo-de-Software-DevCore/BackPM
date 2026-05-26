import PDFDocument from "pdfkit"
import { PassThrough } from "stream"

import { OPENROUTER_API_KEY } from "../../config/env"
import { Project } from "../../entities/Project"
import { Sprint } from "../../entities/Sprint"
import { Task } from "../../entities/Task"
import { getProjectByIdUseCase } from "../projects/GetProjectById"
import { getSprintsByProject } from "../../infrastructure/repositories/SprintRepository"
import { getTasksByProject } from "../../infrastructure/repositories/TaskRepository"
import {
    buildProjectReportContext,
    buildProjectReportHtmlTemplate,
    type ProjectReportContext,
    type ProjectReportInsights,
} from "./ProjectReportTemplate"

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
const OPENROUTER_MODELS = [
    "openai/gpt-oss-20b:free",
    "meta-llama/llama-3.3-70b:free",
    "qwen/qwen3-32b:free",
    "deepseek/deepseek-r1-distill:free",
    "openrouter/free",
]

type OpenRouterResponse = {
    choices?: Array<{
        message?: {
            content?: string
        }
    }>
}

const formatDate = (value: string | null) => {
    if (!value) {
        return "N/A"
    }

    return new Intl.DateTimeFormat("es-ES", {
        dateStyle: "medium",
    }).format(new Date(value))
}

const parseInsights = (content: string): ProjectReportInsights | null => {
    const match = content.match(/\{[\s\S]*\}/)

    if (!match) {
        return null
    }

    const parsed = JSON.parse(match[0]) as Partial<ProjectReportInsights>

    return {
        title: typeof parsed.title === "string" && parsed.title.trim().length > 0 ? parsed.title : "Project Report",
        executiveSummary: typeof parsed.executiveSummary === "string" ? parsed.executiveSummary : "",
        highlights: Array.isArray(parsed.highlights) ? parsed.highlights.filter((item): item is string => typeof item === "string") : [],
        risks: Array.isArray(parsed.risks) ? parsed.risks.filter((item): item is string => typeof item === "string") : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.filter((item): item is string => typeof item === "string") : [],
        nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps.filter((item): item is string => typeof item === "string") : [],
    }
}

const buildMessages = (context: ProjectReportContext) => {
    const templateHtml = buildProjectReportHtmlTemplate(context, {
        title: "Project Report",
        executiveSummary: "",
        highlights: [],
        risks: [],
        recommendations: [],
        nextSteps: [],
    })

    return [
        {
            role: "system" as const,
            content: `You are a project reporting assistant.

STRICT RULES:
- Return ONLY valid JSON.
- No markdown.
- No explanations.
- Do not invent data that is not supported by the project context.
- Keep the language concise and practical.

Return this JSON shape:
{
  "title": "",
  "executiveSummary": "",
  "highlights": [""],
  "risks": [""],
  "recommendations": [""],
  "nextSteps": [""]
}`,
        },
        {
            role: "user" as const,
            content: `Analyze this Scrum project and generate a concise executive report based only on the provided data.

Project data:
${JSON.stringify(context, null, 2)}

Desired HTML template for the report layout:
${templateHtml}
`,
        },
    ]
}

const isRetryableOpenRouterError = (status: number, body: string) =>
    status === 429 || status === 500 || status === 502 || status === 503 || body.includes("no healthy upstream") || body.includes("Provider returned error")

const callOpenRouter = async (context: ProjectReportContext): Promise<ProjectReportInsights | null> => {
    if (!OPENROUTER_API_KEY) {
        console.warn("OpenRouter report generation skipped: OPENROUTER_API_KEY is missing.")
        return null
    }

    let lastError: Error | null = null

    for (const model of OPENROUTER_MODELS) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        try {
            console.info(`[OpenRouter][Report] Requesting model: ${model}`)

            const response = await fetch(OPENROUTER_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    "HTTP-Referer": "https://devcore.app",
                    "X-OpenRouter-Title": "DevCore PM",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model,
                    messages: buildMessages(context),
                }),
                signal: controller.signal,
            })

            if (response.ok) {
                console.info(`[OpenRouter][Report] Model succeeded: ${model}`)
                const data = (await response.json()) as OpenRouterResponse
                const content = data.choices?.[0]?.message?.content

                if (!content) {
                    console.warn(`[OpenRouter][Report] Empty content from model: ${model}`)
                    return null
                }

                try {
                    return parseInsights(content)
                } catch (error) {
                    lastError = error instanceof Error ? error : new Error(String(error))
                    continue
                }
            }

            const errorBody = await response.text()
            lastError = new Error(`OpenRouter API error using ${model}: ${response.statusText} - ${errorBody}`)
            console.warn(`[OpenRouter][Report] Model failed: ${model} (${response.status})`)

            if (!isRetryableOpenRouterError(response.status, errorBody)) {
                throw lastError
            }
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error))
        } finally {
            clearTimeout(timeoutId)
        }
    }

    if (lastError) {
        console.warn("OpenRouter project report generation failed, falling back to local report:", lastError.message)
    }

    return null
}

const buildLocalInsights = (context: ProjectReportContext): ProjectReportInsights => {
    const { project, stats } = context
    const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0

    return {
        title: `${project.name} Report`,
        executiveSummary: `The project currently tracks ${stats.totalTasks} tasks with a ${completionRate}% completion rate and ${stats.totalSprints} sprint${stats.totalSprints === 1 ? "" : "s"}.`,
        highlights: [
            `${stats.completedTasks} completed tasks and ${stats.averageProgress}% average progress`,
            `${stats.activeSprints} active sprint${stats.activeSprints === 1 ? "" : "s"} and ${stats.plannedSprints} planned sprint${stats.plannedSprints === 1 ? "" : "s"}`,
            `${stats.inProgressTasks} task${stats.inProgressTasks === 1 ? "" : "s"} currently in progress`,
        ],
        risks: [
            stats.overdueTasks > 0
                ? `${stats.overdueTasks} task${stats.overdueTasks === 1 ? "" : "s"} are overdue.`
                : "No overdue tasks detected in the current snapshot.",
            stats.pendingTasks > 0
                ? `${stats.pendingTasks} pending task${stats.pendingTasks === 1 ? "" : "s"} may affect delivery if they stay blocked.`
                : "Backlog pressure is currently low.",
        ],
        recommendations: [
            "Prioritize overdue and in-progress tasks before opening new scope.",
            "Review sprint capacity and redistribute work if average progress stays flat.",
            "Reassess pending tasks with dates near the current sprint window.",
        ],
        nextSteps: [
            "Review the current sprint goal and adjust task priority.",
            "Validate upcoming deadlines against the sprint plan.",
            "Run the report again after the next batch of task updates.",
        ],
    }
}

const bufferFromDocument = async (document: PDFKit.PDFDocument) => {
    return await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = []
        const stream = new PassThrough()

        stream.on("data", (chunk) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        })

        stream.on("end", () => {
            resolve(Buffer.concat(chunks))
        })

        stream.on("error", reject)

        document.pipe(stream)
        document.end()
    })
}

const addBulletSection = (document: PDFKit.PDFDocument, title: string, items: string[]) => {
    document.moveDown(0.5)
    document.fontSize(14).fillColor("#0f172a").text(title, { continued: false })
    document.moveDown(0.2)
    document.fontSize(11).fillColor("#334155")

    if (items.length === 0) {
        document.text("No data available.")
        return
    }

    items.forEach((item) => {
        document.text(`• ${item}`, { indent: 12, paragraphGap: 4 })
    })
}

const buildPdfBuffer = async (context: ProjectReportContext, insights: ProjectReportInsights) => {
    const document = new PDFDocument({ size: "A4", margin: 44 })

    const completionRate = context.stats.totalTasks > 0
        ? Math.round((context.stats.completedTasks / context.stats.totalTasks) * 100)
        : 0

    document.info.Title = insights.title
    document.info.Author = "DevCore PM"

    document.fontSize(22).fillColor("#0f172a").text(insights.title)
    document.moveDown(0.2)
    document.fontSize(11).fillColor("#64748b").text(`${context.project.name} · ${context.project.client} · Generated ${new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(new Date())}`)

    document.moveDown(1)
    document.fontSize(11).fillColor("#0f172a").text(insights.executiveSummary)

    document.moveDown(1)
    document.fontSize(14).fillColor("#0f172a").text("Key Metrics")
    document.moveDown(0.4)
    document.fontSize(11).fillColor("#334155")
    document.text(`Total tasks: ${context.stats.totalTasks}`)
    document.text(`Completed tasks: ${context.stats.completedTasks}`)
    document.text(`In progress tasks: ${context.stats.inProgressTasks}`)
    document.text(`Pending tasks: ${context.stats.pendingTasks}`)
    document.text(`Overdue tasks: ${context.stats.overdueTasks}`)
    document.text(`Average progress: ${context.stats.averageProgress}%`)
    document.text(`Completion rate: ${completionRate}%`)
    document.text(`Total sprints: ${context.stats.totalSprints}`)
    document.text(`Active sprints: ${context.stats.activeSprints}`)
    document.text(`Finished sprints: ${context.stats.finishedSprints}`)
    document.text(`Planned sprints: ${context.stats.plannedSprints}`)

    addBulletSection(document, "Highlights", insights.highlights)
    addBulletSection(document, "Risks", insights.risks)
    addBulletSection(document, "Recommendations", insights.recommendations)
    addBulletSection(document, "Next Steps", insights.nextSteps)

    document.moveDown(1)
    document.fontSize(12).fillColor("#0f172a").text("Upcoming Tasks")
    document.moveDown(0.3)
    document.fontSize(10).fillColor("#334155")

    if (context.upcomingTasks.length === 0) {
        document.text("No upcoming tasks available.")
    } else {
        context.upcomingTasks.forEach((task) => {
            document.text(`${task.title} · ${task.status} · ${formatDate(task.endDate)} · ${task.progress}%`)
        })
    }

    document.moveDown(1)
    document.fontSize(12).fillColor("#0f172a").text("Sprints")
    document.moveDown(0.3)
    document.fontSize(10).fillColor("#334155")

    if (context.sprints.length === 0) {
        document.text("No sprint data available.")
    } else {
        context.sprints.forEach((sprint) => {
            document.text(`${sprint.name} · ${sprint.status} · ${formatDate(sprint.startDate)} to ${formatDate(sprint.endDate)}`)
        })
    }

    return await bufferFromDocument(document)
}

export const generateProjectReport = async (projectId: string, userId: string) => {
    const project = await getProjectByIdUseCase(projectId, userId)
    const tasks = await getTasksByProject(projectId)
    const sprints = await getSprintsByProject(projectId)

    const context = buildProjectReportContext(project as Project, tasks as Task[], sprints as Sprint[])
    const aiInsights = await callOpenRouter(context)
    const insights = aiInsights ?? buildLocalInsights(context)
    const buffer = await buildPdfBuffer(context, insights)

    return {
        buffer,
        filename: `${project.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-report.pdf`,
        insights,
        context,
    }
}