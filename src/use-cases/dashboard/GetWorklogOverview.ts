import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject, getProjectMembers } from "../../infrastructure/repositories/MemberProjectRepository"
import { getTasksByProject } from "../../infrastructure/repositories/TaskRepository"
import { computeWeeklyProgress, WeeklyProgressResponse } from "./GetWeeklyProgress"
import { computeWeeklyVelocity, WeeklyVelocityResponse } from "./GetWeeklyVelocity"
import { Task } from "../../entities/Task"
import { ProjectRole } from "../../entities/MemberProject"

export interface WorklogOverviewMember {
    id_user: string
    role: ProjectRole
}

export interface WorklogOverviewResponse {
    tasks: Task[]
    members: WorklogOverviewMember[]
    weeklyProgress: WeeklyProgressResponse
    weeklyVelocity: WeeklyVelocityResponse
}

/**
 * Agrega en UNA respuesta todo lo que la página de worklogs pedía para un proyecto:
 * tasks + members + progreso semanal (diario) + serie de velocidad. Reemplaza la
 * "ola 2" de 4 requests en paralelo por 1 sola. El directorio de usuarios se sigue
 * pidiendo aparte porque está cacheado/prefetcheado (cache hit instantáneo).
 *
 * Proyección segura de members: solo id_user/role (sin monthly_rate/fte).
 */
export const getWorklogOverviewUseCase = async (
    userId: string,
    projectId: string,
    weeks = 5
): Promise<WorklogOverviewResponse> => {
    // Validación de acceso UNA vez (tasks/members son repos crudos sin auth propia).
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }
    const isMember = await isMemberProject(userId, projectId)
    if (!isMember && project.createdBy !== userId) {
        throw new Error("No tienes acceso a este proyecto")
    }

    // Acceso ya validado arriba: llamamos al cómputo puro (sin re-validar el proyecto).
    const [tasks, members, weeklyProgress, weeklyVelocity] = await Promise.all([
        getTasksByProject(projectId),
        getProjectMembers(projectId),
        computeWeeklyProgress([projectId], 0),
        computeWeeklyVelocity([projectId], weeks),
    ])

    return {
        tasks,
        members: members.map((member) => ({ id_user: member.id_user, role: member.role })),
        weeklyProgress,
        weeklyVelocity,
    }
}
