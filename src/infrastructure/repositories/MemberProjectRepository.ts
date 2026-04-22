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

export const addMemberToProject = async (userId: string,projectId: string, role: ProjectRole): Promise<MemberProject> => {
    const member = repo.create({
        id_user: userId,
        id_project: projectId,
        role
    })
    
    return await repo.save(member)
}