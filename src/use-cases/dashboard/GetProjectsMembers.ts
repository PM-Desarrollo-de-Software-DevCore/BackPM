import { getProjectsByUser } from "../../infrastructure/repositories/ProjectRepository"
import { getMembersByProjects } from "../../infrastructure/repositories/MemberProjectRepository"
import { ProjectRole } from "../../entities/MemberProject"

// Proyeccion segura: solo lo necesario para pintar avatares en la lista de proyectos.
// SIN monthly_rate ni fte (sensible, visible solo a admin/PM en su endpoint propio).
export interface ProjectsMembersItem {
    id_project: string
    id_user: string
    role: ProjectRole
}

export interface ProjectsMembersResponse {
    members: ProjectsMembersItem[]
}

/**
 * Devuelve los miembros de TODOS los proyectos del usuario en UNA query bulk (In),
 * reemplazando el N+1 de la página de proyectos (cada ProjectCard pedía
 * GET /projects/:id/members por separado => 2+N requests).
 */
export const getProjectsMembersUseCase = async (userId: string): Promise<ProjectsMembersResponse> => {
    const projects = await getProjectsByUser(userId)
    const projectIds = projects.map((project) => project.id_project)

    const members = await getMembersByProjects(projectIds)

    return {
        members: members.map((member) => ({
            id_project: member.id_project,
            id_user: member.id_user,
            role: member.role,
        })),
    }
}
