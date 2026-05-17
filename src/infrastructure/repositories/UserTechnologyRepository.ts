import { AppDataSource } from "../db/DataSource"
import { UserTechnologyEntity } from "../db/entities/UserTechnologyEntity"
import { UserTechnology } from "../../entities/UserTechnology"

const repo = AppDataSource.getRepository(UserTechnologyEntity)

export const createUserTechnology = async (
    data: Omit<UserTechnology, "id_user_tech" | "createdAt">
): Promise<UserTechnology> => {
    const tech = repo.create(data)
    return await repo.save(tech)
}

export const getUserTechnologyById = async (id: string): Promise<UserTechnology | null> => {
    return await repo.findOne({ where: { id_user_tech: id } })
}

export const getUserTechnologiesByUser = async (userId: string): Promise<UserTechnology[]> => {
    return await repo.find({
        where: { id_user: userId },
        order: { yearsOfExperience: "DESC", technology: "ASC" }
    })
}

export const existsUserTechnology = async (userId: string, technology: string): Promise<boolean> => {
    const found = await repo.findOne({ where: { id_user: userId, technology } })
    return found !== null
}

export const updateUserTechnology = async (
    id: string,
    data: Partial<Pick<UserTechnology, "technology" | "yearsOfExperience">>
): Promise<UserTechnology | null> => {
    await repo.update({ id_user_tech: id }, data)
    return await getUserTechnologyById(id)
}

export const deleteUserTechnology = async (id: string): Promise<boolean> => {
    const result = await repo.delete({ id_user_tech: id })
    return (result.affected ?? 0) > 0
}
