import { createProgressEntry } from "../../infrastructure/repositories/ProgressEntryRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { getSprintById } from "../../infrastructure/repositories/SprintRepository"
import { ProgressEntry, ProgressEntryType } from "../../entities/ProgressEntry"

export const createProgressEntryUseCase = async (
    data: { type: ProgressEntryType; description: string; date?: Date; id_sprint?: string | null },
    projectId: string,
    userId: string
): Promise<ProgressEntry> => {
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    // Cualquier miembro del proyecto (o su creador) puede registrar avances/bloqueadores
    const isMember = await isMemberProject(userId, projectId)
    if (!isMember && project.createdBy !== userId) {
        throw new Error("No tienes acceso a este proyecto")
    }

    if (!Object.values(ProgressEntryType).includes(data.type)) {
        throw new Error("El tipo debe ser 'progress' (avance) o 'blocker' (bloqueador)")
    }
    if (!data.description || data.description.trim().length === 0) {
        throw new Error("La descripción es obligatoria")
    }

    const date = data.date ?? new Date()
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error("La fecha no es válida")
    }

    const id_sprint = data.id_sprint ?? null
    if (id_sprint) {
        const sprint = await getSprintById(id_sprint)
        if (!sprint) {
            throw new Error("Sprint no encontrado")
        }
        if (sprint.id_project !== projectId) {
            throw new Error("El sprint no pertenece al proyecto")
        }
    }

    return await createProgressEntry({
        type: data.type,
        description: data.description,
        date,
        id_project: projectId,
        id_sprint,
        createdBy: userId
    })
}
