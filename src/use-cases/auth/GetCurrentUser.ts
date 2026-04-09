import { findUserById } from "../../infrastructure/repositories/UserRepository"

export const getCurrentUser = async (userId: string) => {
    const user = await findUserById(userId)

    if (!user) {
        throw new Error("Usuario no encontrado")
    }

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        lastname: user.lastname,
        role: user.role,
    }
}
