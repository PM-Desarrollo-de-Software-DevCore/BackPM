import { findUserById } from "../../infrastructure/repositories/UserRepository"
import {
    existsUserTechnology,
    getUserTechnologyById,
    updateUserTechnology
} from "../../infrastructure/repositories/UserTechnologyRepository"
import { GlobalRole } from "../../entities/User"

const MAX_YEARS = 80

interface UpdatePayload {
    technology?: string
    yearsOfExperience?: number
}

export const updateUserTechnologyUseCase = async (
    techId: string,
    requesterId: string,
    payload: UpdatePayload
) => {
    const existing = await getUserTechnologyById(techId)
    if (!existing) {
        throw new Error("Tecnologia no encontrada")
    }

    const requester = await findUserById(requesterId)
    if (!requester) {
        throw new Error("Usuario solicitante no encontrado")
    }

    const isOwner = existing.id_user === requesterId
    const isAdmin = requester.globalRole === GlobalRole.ADMIN
    if (!isOwner && !isAdmin) {
        throw new Error("Solo puedes editar tus propias tecnologias")
    }

    const updates: UpdatePayload = {}

    if (payload.technology !== undefined) {
        if (typeof payload.technology !== "string" || payload.technology.trim().length === 0) {
            throw new Error("La tecnologia no puede estar vacia")
        }
        if (payload.technology.trim().length > 100) {
            throw new Error("La tecnologia no puede tener mas de 100 caracteres")
        }
        const trimmed = payload.technology.trim()
        if (trimmed !== existing.technology) {
            if (await existsUserTechnology(existing.id_user, trimmed)) {
                throw new Error("Esa tecnologia ya esta registrada para este usuario")
            }
            updates.technology = trimmed
        }
    }

    if (payload.yearsOfExperience !== undefined) {
        if (!Number.isInteger(payload.yearsOfExperience) ||
            payload.yearsOfExperience < 0 ||
            payload.yearsOfExperience > MAX_YEARS) {
            throw new Error(`Los anos de experiencia deben ser un entero entre 0 y ${MAX_YEARS}`)
        }
        updates.yearsOfExperience = payload.yearsOfExperience
    }

    if (Object.keys(updates).length === 0) {
        return existing
    }

    const updated = await updateUserTechnology(techId, updates)
    if (!updated) {
        throw new Error("No se pudo actualizar la tecnologia")
    }
    return updated
}
