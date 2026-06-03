import { getProjectsByUser } from "../../infrastructure/repositories/ProjectRepository"
import { getSprintsByProjects } from "../../infrastructure/repositories/SprintRepository"
import { getTasksByProjects } from "../../infrastructure/repositories/TaskRepository"
import { Sprint } from "../../entities/Sprint"
import { Task } from "../../entities/Task"

export interface SearchIndexResponse {
    sprints: Sprint[]
    tasks: Task[]
}

/**
 * Índice para el buscador global. Reemplaza el 1 + 2*N requests que GlobalSearchBar
 * hacía (getProjects + por cada proyecto getProjectSprints + getProjectTasks) por
 * 2 queries bulk con In(...) sobre los proyectos del usuario. El frontend ya tiene
 * la lista de proyectos (getProjects) y resuelve projectName en memoria.
 * Cada sprint/task incluye id_project para agrupar/joinear en el cliente.
 */
export const getSearchIndexUseCase = async (userId: string): Promise<SearchIndexResponse> => {
    const projects = await getProjectsByUser(userId)
    const projectIds = projects.map((project) => project.id_project)

    const [sprints, tasks] = await Promise.all([
        getSprintsByProjects(projectIds),
        getTasksByProjects(projectIds),
    ])

    return { sprints, tasks }
}
