import { getTasksBySprint } from "../../infrastructure/repositories/TaskRepository"
import { getSprintById } from "../../infrastructure/repositories/SprintRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"

export const getTasksBySprintUseCase = async (sprintId: string, userId: string) => {
    const sprint = await getSprintById(sprintId)
    if (!sprint) {
        throw new Error("Sprint no encontrado")
    }

    const project = await getProjectById(sprint.id_project)
    if (!project) {
        throw new Error("Proyecto del sprint no encontrado")
    }

    const isMember = await isMemberProject(userId, sprint.id_project)
    if (!isMember && project.createdBy !== userId) {
        throw new Error("No tienes acceso a las tareas de este sprint")
    }

    return await getTasksBySprint(sprintId)
}
