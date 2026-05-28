import { getProgressEntriesByProject, ProgressEntryFilters } from "../../infrastructure/repositories/ProgressEntryRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { ProgressEntry } from "../../entities/ProgressEntry"

// Lista historica de avances y bloqueadores del proyecto (filtros opcionales por tipo y sprint)
export const getProgressEntriesByProjectUseCase = async (
    projectId: string,
    userId: string,
    filters: ProgressEntryFilters = {}
): Promise<ProgressEntry[]> => {
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    const isMember = await isMemberProject(userId, projectId)
    if (!isMember && project.createdBy !== userId) {
        throw new Error("No tienes acceso a este proyecto")
    }

    return await getProgressEntriesByProject(projectId, filters)
}
