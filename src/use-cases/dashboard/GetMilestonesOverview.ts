import { getProjectsByUser } from "../../infrastructure/repositories/ProjectRepository"
import { getMembersByProjects } from "../../infrastructure/repositories/MemberProjectRepository"
import { getSprintsByProjects } from "../../infrastructure/repositories/SprintRepository"
import { findAllUsers } from "../../infrastructure/repositories/UserRepository"
import { getProjectsStatsUseCase, ProjectChartItem } from "./GetProjectsStats"
import { ProjectPriority, ProjectStatus } from "../../entities/Project"
import { ProjectRole } from "../../entities/MemberProject"
import { SprintStatus } from "../../entities/Sprint"

// Proyeccion segura de proyecto: SIN campos financieros (budget, monthly_cost, billing_model)
// ni de cliente. Solo lo que la vista de milestones necesita.
export interface MilestoneOverviewProject {
    id_project: string
    name: string
    description: string | null
    start_date: Date
    end_date: Date | null
    priority: ProjectPriority
    status: ProjectStatus
    createdBy: string
    createdAt: Date
}

// Proyeccion segura de miembro: SIN monthly_rate ni fte (rate visible solo a admin/PM en su endpoint propio).
export interface MilestoneOverviewMember {
    id_mp: string
    id_user: string
    id_project: string
    role: ProjectRole
}

export interface MilestoneOverviewSprint {
    id_sprint: string
    name: string
    start_date: Date
    end_date: Date
    status: SprintStatus
    id_project: string
    createdAt: Date
}

// Proyeccion minima de usuario (directorio): sin PII sensible (telefono, cv, password).
export interface MilestoneOverviewUser {
    id: string
    email: string
    name: string
    lastname: string
    profileImageUrl: string | null
}

export interface MilestonesOverviewResponse {
    projects: MilestoneOverviewProject[]
    projectStats: ProjectChartItem[]
    users: MilestoneOverviewUser[]
    members: MilestoneOverviewMember[]
    sprints: MilestoneOverviewSprint[]
}

/**
 * Agrega en UNA sola respuesta todo lo que la pagina de milestones consumia con
 * 3 + 2*N requests (projects + projects-stats + users, mas members y sprints por proyecto).
 * Colapsa los 2*N round-trips a 2 queries bulk (In(...)), apoyadas en los indices
 * IX_member_project_id_project / IX_sprints_id_project.
 */
export const getMilestonesOverviewUseCase = async (
    userId: string
): Promise<MilestonesOverviewResponse> => {
    const projects = await getProjectsByUser(userId)
    const projectIds = projects.map((project) => project.id_project)

    const [stats, members, sprints, allUsers] = await Promise.all([
        getProjectsStatsUseCase(userId),
        getMembersByProjects(projectIds),
        getSprintsByProjects(projectIds),
        findAllUsers(),
    ])

    // Solo los usuarios referenciados (miembros + creadores) para no enviar todo el directorio.
    const referencedUserIds = new Set<string>()
    members.forEach((member) => referencedUserIds.add(member.id_user))
    projects.forEach((project) => referencedUserIds.add(project.createdBy))

    const users: MilestoneOverviewUser[] = allUsers
        .filter((user) => referencedUserIds.has(user.id))
        .map((user) => ({
            id: user.id,
            email: user.email,
            name: user.name,
            lastname: user.lastname,
            profileImageUrl: user.profileImageUrl ?? null,
        }))

    return {
        projects: projects.map((project) => ({
            id_project: project.id_project,
            name: project.name,
            description: project.description,
            start_date: project.start_date,
            end_date: project.end_date,
            priority: project.priority,
            status: project.status,
            createdBy: project.createdBy,
            createdAt: project.createdAt,
        })),
        projectStats: stats.projectsChart,
        users,
        members: members.map((member) => ({
            id_mp: member.id_mp,
            id_user: member.id_user,
            id_project: member.id_project,
            role: member.role,
        })),
        sprints: sprints.map((sprint) => ({
            id_sprint: sprint.id_sprint,
            name: sprint.name,
            start_date: sprint.start_date,
            end_date: sprint.end_date,
            status: sprint.status,
            id_project: sprint.id_project,
            createdAt: sprint.createdAt,
        })),
    }
}
