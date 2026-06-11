import { In } from "typeorm"
import { AppDataSource } from "../db/DataSource"
import { MemberProjectEntity } from "../db/entities/MemberProjectEntity"
import { MemberProject, ProjectRole } from "../../entities/MemberProject"

// Hacer un select de la tabla MemberProjectEntity
const repo = AppDataSource.getRepository(MemberProjectEntity)


export const isMemberProject = async (userId: string, projectId: string): Promise<MemberProject | null> => {
    return await repo.findOne( {
        where: {
            id_user: userId,
            id_project: projectId
        }
    })
}

export const getUserRoleInProject = async (userId: string, projectId: string): Promise<string | null> => {
    const member = await repo.findOne({
        where: {
            id_user: userId,
            id_project: projectId
        }
    })
    return member?.role || null
}

export const addMemberToProject = async (
    userId: string,
    projectId: string,
    role: ProjectRole,
    fte: number | null = null,
    monthlyRate: number | null = null,
    saleRate: number | null = null
): Promise<MemberProject> => {
    const member = repo.create({
        id_user: userId,
        id_project: projectId,
        role,
        fte,
        monthly_rate: monthlyRate,
        sale_rate: saleRate
    })

    return await repo.save(member)
}

export const getProjectMembers = async (projectId: string): Promise<MemberProject[]> => {
    return await repo.find({ where: { id_project: projectId } })
}

// Bulk: todos los miembros de varios proyectos en UNA query (evita N+1 en milestones-overview)
export const getMembersByProjects = async (projectIds: string[]): Promise<MemberProject[]> => {
    if (projectIds.length === 0) return []
    return await repo.find({ where: { id_project: In(projectIds) } })
}

export const updateMemberRole = async (userId: string, projectId: string, newRole: ProjectRole): Promise<MemberProject | null> => {
    await repo.update(
        { id_user: userId, id_project: projectId },
        { role: newRole }
    )
    return await isMemberProject(userId, projectId)
}

export const updateMember = async (
    userId: string,
    projectId: string,
    data: Partial<Pick<MemberProject, "role" | "fte" | "monthly_rate" | "sale_rate">>
): Promise<MemberProject | null> => {
    await repo.update({ id_user: userId, id_project: projectId }, data)
    return await isMemberProject(userId, projectId)
}

export const removeMemberFromProject = async (userId: string, projectId: string): Promise<boolean> => {
    const result = await repo.delete({ id_user: userId, id_project: projectId })
    return (result.affected ?? 0) > 0
}

export const countProjectManagers = async (projectId: string): Promise<number> => {
    return await repo.count({
        where: {
            id_project: projectId,
            role: ProjectRole.PROJECT_MANAGER
        }
    })
}

export const countMembersByRole = async (projectId: string, role: ProjectRole): Promise<number> => {
    return await repo.count({
        where: {
            id_project: projectId,
            role
        }
    })
}