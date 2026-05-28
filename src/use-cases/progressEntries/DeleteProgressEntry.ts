import { getProgressEntryById, deleteProgressEntry } from "../../infrastructure/repositories/ProgressEntryRepository"
import { getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { ProjectRole } from "../../entities/MemberProject"

export const deleteProgressEntryUseCase = async (entryId: string, userId: string) => {
    const entry = await getProgressEntryById(entryId)
    if (!entry) {
        throw new Error("Registro no encontrado")
    }

    // Puede borrar el autor del registro, o un project_manager / scrum_master del proyecto
    const isAuthor = entry.createdBy === userId
    let userRole = await getUserRoleInProject(userId, entry.id_project)
    if (!userRole) {
        const project = await getProjectById(entry.id_project)
        if (project && project.createdBy === userId) {
            userRole = ProjectRole.PROJECT_MANAGER
        }
    }
    const isPMorSM = userRole === ProjectRole.PROJECT_MANAGER || userRole === ProjectRole.SCRUM_MASTER

    if (!isAuthor && !isPMorSM) {
        throw new Error("Solo el autor o un project_manager/scrum_master puede eliminar el registro")
    }

    const deleted = await deleteProgressEntry(entryId)
    if (!deleted) {
        throw new Error("No se pudo eliminar el registro")
    }
    return { message: "Registro eliminado correctamente" }
}
