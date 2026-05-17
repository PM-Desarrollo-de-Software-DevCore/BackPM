import { findUserById } from "../../infrastructure/repositories/UserRepository"
import {
    createUserTechnology,
    existsUserTechnology
} from "../../infrastructure/repositories/UserTechnologyRepository"
import { GlobalRole } from "../../entities/User"
import { UserTechnology } from "../../entities/UserTechnology"

const MAX_YEARS = 80

export const addUserTechnologyUseCase = async (
    targetUserId: string,
    requesterId: string,
    technology: string,
    yearsOfExperience: number
): Promise<UserTechnology> => {
    if (typeof technology !== "string" || technology.trim().length === 0) {
        throw new Error("La tecnologia es obligatoria")
    }
    if (technology.trim().length > 100) {
        throw new Error("La tecnologia no puede tener mas de 100 caracteres")
    }
    if (!Number.isInteger(yearsOfExperience) || yearsOfExperience < 0 || yearsOfExperience > MAX_YEARS) {
        throw new Error(`Los anos de experiencia deben ser un entero entre 0 y ${MAX_YEARS}`)
    }

    const requester = await findUserById(requesterId)
    if (!requester) {
        throw new Error("Usuario solicitante no encontrado")
    }

    const isOwner = requesterId === targetUserId
    const isAdmin = requester.globalRole === GlobalRole.ADMIN
    if (!isOwner && !isAdmin) {
        throw new Error("Solo puedes agregar tecnologias a tu propio perfil")
    }

    const target = await findUserById(targetUserId)
    if (!target) {
        throw new Error("Usuario destino no encontrado")
    }

    const trimmed = technology.trim()
    if (await existsUserTechnology(targetUserId, trimmed)) {
        throw new Error("Esa tecnologia ya esta registrada para este usuario")
    }

    return await createUserTechnology({
        id_user: targetUserId,
        technology: trimmed,
        yearsOfExperience
    })
}
