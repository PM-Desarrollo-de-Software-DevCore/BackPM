import { OPENROUTER_API_KEY } from "../../config/env"
import { GlobalRole } from "../../entities/User"
import { findAllUsers } from "../../infrastructure/repositories/UserRepository"
import { getProjectMembers } from "../../infrastructure/repositories/MemberProjectRepository"

type AssignmentScope = "project" | "task"

export interface AssignmentSuggestionInput {
    scope: AssignmentScope
    title: string
    description?: string | null
    projectId?: string | null
    limit?: number
}

export interface AssignmentSuggestionItem {
    userId: string
    name: string
    lastname: string
    email: string
    skill: string | null
    area: string | null
    points: number
    completedTasks: number
    score: number
    reasons: string[]
}

interface AssignmentSignals {
    keywords: string[]
    skills: string[]
    areas: string[]
    tools: string[]
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
const OPENROUTER_MODELS = [
    "openai/gpt-oss-20b:free",
    "meta-llama/llama-3.3-70b:free",
    "qwen/qwen3-32b:free",
    "deepseek/deepseek-r1-distill:free",
    "openrouter/free"
]

const areaPatterns: Array<{ area: string; terms: string[] }> = [
    { area: "frontend", terms: ["frontend", "front end", "react", "next", "nextjs", "ui", "ux", "interfaces"] },
    { area: "backend", terms: ["backend", "back end", "api", "node", "express", "nestjs", "server"] },
    { area: "fullstack", terms: ["fullstack", "full stack"] },
    { area: "mobile", terms: ["mobile", "android", "ios", "flutter", "react native"] },
    { area: "qa", terms: ["qa", "testing", "test", "automation", "playwright", "cypress"] },
    { area: "devops", terms: ["devops", "ci/cd", "docker", "kubernetes", "cloud", "aws"] },
    { area: "database", terms: ["database", "sql", "mssql", "mysql", "postgres", "typeorm", "prisma"] },
    { area: "data", terms: ["data", "analytics", "etl", "bi", "warehouse", "pipeline"] }
]

const skillPatterns: Array<{ skill: string; terms: string[] }> = [
    { skill: "typescript", terms: ["typescript", "ts"] },
    { skill: "javascript", terms: ["javascript", "js"] },
    { skill: "react", terms: ["react"] },
    { skill: "nextjs", terms: ["next", "nextjs"] },
    { skill: "node", terms: ["node", "nodejs"] },
    { skill: "express", terms: ["express"] },
    { skill: "sql", terms: ["sql", "mssql", "mysql", "postgres"] },
    { skill: "testing", terms: ["testing", "playwright", "cypress", "jest"] },
    { skill: "api", terms: ["api", "rest", "graphql"] },
    { skill: "cloud", terms: ["cloud", "aws", "azure", "gcp"] }
]

const toolPatterns: Array<{ tool: string; terms: string[] }> = [
    { tool: "react", terms: ["react"] },
    { tool: "nextjs", terms: ["next", "nextjs"] },
    { tool: "node", terms: ["node", "express"] },
    { tool: "docker", terms: ["docker"] },
    { tool: "typeorm", terms: ["typeorm"] },
    { tool: "playwright", terms: ["playwright"] },
    { tool: "sql", terms: ["sql", "mssql", "mysql", "postgres"] }
]

const normalize = (value: string): string =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()

const tokenize = (value: string): string[] => {
    const matches = normalize(value).match(/[a-z0-9#+.-]+/g)
    return matches ? Array.from(new Set(matches)) : []
}

const buildLocalSignals = (title: string, description?: string | null): AssignmentSignals => {
    const text = `${title} ${description ?? ""}`
    const lowered = normalize(text)
    const tokens = tokenize(text)

    return {
        keywords: Array.from(new Set(tokens.filter((token) => token.length > 2).slice(0, 12))),
        skills: skillPatterns.filter(({ terms }) => terms.some((term) => lowered.includes(normalize(term)))).map(({ skill }) => skill),
        areas: areaPatterns.filter(({ terms }) => terms.some((term) => lowered.includes(normalize(term)))).map(({ area }) => area),
        tools: toolPatterns.filter(({ terms }) => terms.some((term) => lowered.includes(normalize(term)))).map(({ tool }) => tool)
    }
}

const buildMessages = (title: string, description?: string | null) => {
    const descriptionText = description?.trim() || ""

    return [
        {
            role: "system" as const,
            content: `You extract concise assignment signals from project and task descriptions.

STRICT RULES:
- Return ONLY valid JSON
- No explanations
- No extra text
- Use lowercase keywords
- Do not invent information that is not strongly implied

Return this JSON shape:
{
  "keywords": [""],
  "skills": [""],
  "areas": [""],
  "tools": [""]
}`
        },
        {
            role: "user" as const,
            content: `Analyze the following content and extract the best assignment signals for matching users by skills, areas, and tools.

Title: ${title}
Description: ${descriptionText}
`
        }
    ]
}

const parseSignals = (content: string): AssignmentSignals | null => {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
        return null
    }

    const parsed = JSON.parse(jsonMatch[0]) as Partial<AssignmentSignals>

    return {
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords.filter(Boolean).map(normalize) : [],
        skills: Array.isArray(parsed.skills) ? parsed.skills.filter(Boolean).map(normalize) : [],
        areas: Array.isArray(parsed.areas) ? parsed.areas.filter(Boolean).map(normalize) : [],
        tools: Array.isArray(parsed.tools) ? parsed.tools.filter(Boolean).map(normalize) : []
    }
}

const isRetryableOpenRouterError = (status: number, body: string) =>
    status === 429 || status === 500 || status === 502 || status === 503 || body.includes("no healthy upstream") || body.includes("Provider returned error")

const callOpenRouter = async (title: string, description?: string | null): Promise<AssignmentSignals | null> => {
    if (!OPENROUTER_API_KEY) {
        return null
    }

    let lastError: Error | null = null

    for (const model of OPENROUTER_MODELS) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3500)

        try {
            const response = await fetch(OPENROUTER_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    "HTTP-Referer": "https://devcore.app",
                    "X-OpenRouter-Title": "DevCore PM",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model,
                    messages: buildMessages(title, description)
                }),
                signal: controller.signal
            })

            if (response.ok) {
                const data = await response.json() as any
                const content = data.choices?.[0]?.message?.content

                if (!content) {
                    return null
                }

                try {
                    return parseSignals(content)
                } catch (error) {
                    lastError = error instanceof Error ? error : new Error(String(error))
                    continue
                }
            }

            const errorBody = await response.text()
            lastError = new Error(`OpenRouter API error using ${model}: ${response.statusText} - ${errorBody}`)

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
        console.warn("OpenRouter assignment parsing failed, falling back to local signals:", lastError.message)
    }

    return null
}

const countMatches = (terms: string[], candidates: Array<string | null | undefined>): number => {
    const normalizedTerms = terms.map(normalize)
    const normalizedCandidates = candidates.filter(Boolean).map((candidate) => normalize(candidate as string))

    return normalizedCandidates.reduce((total, candidate) => {
        const matched = normalizedTerms.some((term) => candidate.includes(term) || term.includes(candidate))
        return matched ? total + 1 : total
    }, 0)
}

const buildReasons = (
    user: { skill?: string | null; area?: string | null; points?: number },
    signals: AssignmentSignals,
    skillMatches: number,
    areaMatches: number
): string[] => {
    const reasons: string[] = []

    if (skillMatches > 0) {
        reasons.push(`Coincide con ${skillMatches} skill${skillMatches === 1 ? "" : "s"}`)
    }

    if (areaMatches > 0) {
        reasons.push(`Alineado a ${areaMatches} area${areaMatches === 1 ? "" : "s"}`)
    }

    const completedTasks = Math.floor((user.points ?? 0) / 10)
    if (completedTasks > 0) {
        reasons.push(`${completedTasks} tareas completadas`)
    }

    if (signals.keywords.length > 0) {
        reasons.push(`Contexto detectado: ${signals.keywords.slice(0, 3).join(", ")}`)
    }

    return reasons.slice(0, 3)
}

export const recommendAssignees = async ({
    scope,
    title,
    description,
    projectId,
    limit = 5
}: AssignmentSuggestionInput): Promise<{ signals: AssignmentSignals; suggestions: AssignmentSuggestionItem[] }> => {
    const normalizedTitle = title.trim()
    if (!normalizedTitle) {
        throw new Error("El título es obligatorio")
    }

    const localSignals = buildLocalSignals(normalizedTitle, description)
    const aiSignals = await callOpenRouter(normalizedTitle, description)
    const signals = aiSignals ?? localSignals

    const allUsers = await findAllUsers()
    const projectMemberIds = scope === "task" && projectId
        ? new Set((await getProjectMembers(projectId)).map((member) => member.id_user))
        : null

    const candidates = allUsers.filter((user) => user.globalRole !== GlobalRole.ADMIN)
        .filter((user) => !projectMemberIds || projectMemberIds.has(user.id))

    const maxPoints = Math.max(1, ...candidates.map((user) => user.points ?? 0))
    const queryTerms = [
        ...signals.keywords,
        ...signals.skills,
        ...signals.areas,
        ...signals.tools
    ]

    const ranked = candidates.map((user) => {
        const skillMatches = countMatches(queryTerms, [user.skill, user.area])
        const areaMatches = countMatches([...signals.areas, ...signals.keywords], [user.area])
        const pointScore = Math.round(((user.points ?? 0) / maxPoints) * 35)
        const signalScore = Math.min(45, skillMatches * 15 + areaMatches * 10)
        const score = Math.min(100, signalScore + pointScore)

        return {
            userId: user.id,
            name: user.name,
            lastname: user.lastname,
            email: user.email,
            skill: user.skill ?? null,
            area: user.area ?? null,
            points: user.points ?? 0,
            completedTasks: Math.floor((user.points ?? 0) / 10),
            score,
            reasons: buildReasons(user, signals, skillMatches, areaMatches)
        }
    })

    const suggestions = ranked
        .sort((a, b) => b.score - a.score || b.points - a.points || a.name.localeCompare(b.name))
        .slice(0, Math.max(1, limit))

    return {
        signals,
        suggestions
    }
}