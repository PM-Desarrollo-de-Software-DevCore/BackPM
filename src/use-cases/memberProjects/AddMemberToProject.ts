import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { addMemberToProject, isMemberProject, countProjectManagers } from "../../infrastructure/repositories/MemberProjectRepository"
import { findUserById } from "../../infrastructure/repositories/UserRepository"
import { GlobalRole } from "../../entities/User"
import { ProjectRole } from "../../entities/MemberProject"

export const addMemberToProjectUseCase = async (
    projectId: string,
    userIdToAdd: string,
    roleToAssign: ProjectRole,
    adminUserId: string,
    adminGlobalRole: GlobalRole
): Promise<any> => {
    // Validar que solo admin global puede hacer esto
    if (adminGlobalRole !== "admin") {
        throw new Error("Solo administradores pueden agregar miembros a proyectos")
    }

    // Validar que el proyecto existe
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    // Validar que el usuario a agregar existe
    const userToAdd = await findUserById(userIdToAdd)
    if (!userToAdd) {
        throw new Error("Usuario a agregar no encontrado")
    }

    // Validar que el usuario no esté ya en el proyecto
    const alreadyMember = await isMemberProject(userIdToAdd, projectId)
    if (alreadyMember) {
        throw new Error("El usuario ya es miembro de este proyecto")
    }

    // Si se intenta asignar project_manager, validar que solo haya 1 por proyecto
    if (roleToAssign === ProjectRole.PROJECT_MANAGER) {
        const pmCount = await countProjectManagers(projectId)
        if (pmCount > 0) {
            throw new Error("Este proyecto ya tiene un project_manager asignado")
        }
    }

    return await addMemberToProject(userIdToAdd, projectId, roleToAssign)
}