import { getProjectById } from "../../infrastructure/repositories/ProjectRepository"
import { getProjectMembers, getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { GlobalRole } from "../../entities/User"
import { ProjectRole } from "../../entities/MemberProject"

export const getProjectMembersUseCase = async (
    projectId: string,
    requestingUserId: string,
    requesterGlobalRole: GlobalRole
) => {
    const project = await getProjectById(projectId)
    if (!project) {
        throw new Error("Proyecto no encontrado")
    }

    const members = await getProjectMembers(projectId)

    // monthly_rate (costo) y sale_rate (tarifa de venta) son sensibles: solo los ven el admin global y el PM del proyecto.
    const requesterProjectRole = await getUserRoleInProject(requestingUserId, projectId)
    const canSeeRate = requesterGlobalRole === "admin" || requesterProjectRole === ProjectRole.PROJECT_MANAGER

    if (canSeeRate) {
        return members
    }

    return members.map((member) => ({ ...member, monthly_rate: null, sale_rate: null }))
}
