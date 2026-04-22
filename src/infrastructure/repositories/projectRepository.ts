import { AppDataSource } from "../db/DataSource"
import { ProjectEntity } from "../db/entities/ProjectEntity"
import { Project } from "../../entities/Project"

const repo = AppDataSource.getRepository(ProjectEntity)

export const createProject = async (data: Omit<Project, "id_project" | "createdAt">): Promise<Project> => {
    const project = repo.create(data)
    return await repo.save(project)
}

export const getProjectById = async (id: string): Promise<Project | null> => {
    return await repo.findOne({ where: { id_project: id } })
}

export const getProjectsByUser = async (userId: string): Promise<Project[]> => {
    return await repo
        .createQueryBuilder("project")
        .leftJoin("project.members", "member")
        .where("project.createdBy = :userId", { userId })
        .orWhere("member.id_user = :userId", { userId })
        .distinct(true)
        .orderBy("project.createdAt", "DESC")
        .getMany()
}

export const updateProject = async (id: string, data: Partial<Omit<Project, "id_project" | "createdAt" | "createdBy">>): Promise<Project | null> => {
    await repo.update({ id_project: id }, data)
    return await getProjectById(id)
}

export const deleteProject = async (id: string): Promise<boolean> => {
    const result = await repo.delete({ id_project: id })
    return (result.affected ?? 0) > 0
}