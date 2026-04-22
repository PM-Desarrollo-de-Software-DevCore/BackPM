import { deleteProject, getProjectById } from "../../infrastructure/repositories/projectRepository"

export const deleteProjectUseCase = async (projectId: string, userId: string) => {
    const project = await getProjectById(projectId)

    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    if (project.createdBy !== userId) {
        throw new Error("Solo el creador del proyecto puede eliminarlo")
    }

    const deleted = await deleteProject(projectId)

    if (!deleted) {
        throw new Error("No se pudo eliminar el proyecto")
    }

    return { message: "Proyecto eliminado correctamente" }
}