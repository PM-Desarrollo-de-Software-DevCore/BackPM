import { AppDataSource } from "../db/DataSource"
import { UserEntity } from "../db/entities/UserEntity"
import { User } from "../../entities/User"

// Hacer un select de la tabla user
const repo = AppDataSource.getRepository(UserEntity)

// Hacer una consulta 
export const findUserByEmail = async (email: string): Promise<User | null> => {
    return await repo.findOne({ where: { email } })     
}