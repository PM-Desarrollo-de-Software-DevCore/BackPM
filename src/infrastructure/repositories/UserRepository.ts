import { AppDataSource } from "../db/DataSource"
import { UserEntity } from "../db/entities/UserEntity"
import { User } from "../../entities/User"

// Hacer un select de la tabla user
const repo = AppDataSource.getRepository(UserEntity)

// Hacer una consulta 
export const findUserByEmail = async (email: string): Promise<User | null> => {
    return await repo.findOne({ where: { email } })     
}

export const findUserById = async (id: string): Promise<User | null> => {
    return await repo.findOne({ where: { id } })
}

export const saveUser = async (data: Omit<User, "id" | "createdAt">): Promise<User> => {
    const user = repo.create(data)
    return await repo.save(user)
}

export const findUserByResetToken = async (token: string): Promise<User | null> => {
    return await repo.findOne({ where: { resetToken: token } })
}

export const updateResetToken = async (userId: string, token: string, expiry: Date): Promise<void> => {
    await repo.update(userId, {
        resetToken: token,
        resetTokenExpiry: expiry
    })
}

export const clearResetToken = async (userId: string): Promise<void> => {
    await repo.update(userId, {
        resetToken: null,
        resetTokenExpiry: null
    })
}