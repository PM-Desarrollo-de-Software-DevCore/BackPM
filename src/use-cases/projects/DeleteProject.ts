import { deleteProject, getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { deleteSprintsByProject } from "../../infrastructure/repositories/SprintRepository"
import { notifyProjectDeleted } from "../../infrastructure/services/notificationService"

export const deleteProjectUseCase = async (projectId: string, userId: string) => {
    const project = await getProjectById(projectId)

    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    if (project.createdBy !== userId) {
        throw new Error("Solo el creador del proyecto puede eliminarlo")
    }

    await deleteSprintsByProject(projectId)

    const deleted = await deleteProject(projectId)

    if (!deleted) {
        throw new Error("No se pudo eliminar el proyecto")
    }

    await notifyProjectDeleted(project.name, userId)

    return { message: "Proyecto eliminado correctamente" }
}