import { findUserById } from "../../infrastructure/repositories/UserRepository"
import {
    deleteUserTechnology,
    getUserTechnologyById
} from "../../infrastructure/repositories/UserTechnologyRepository"
import { GlobalRole } from "../../entities/User"

export const deleteUserTechnologyUseCase = async (
    techId: string,
    requesterId: string
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
        throw new Error("Solo puedes eliminar tus propias tecnologias")
    }

    const deleted = await deleteUserTechnology(techId)
    if (!deleted) {
        throw new Error("No se pudo eliminar la tecnologia")
    }

    return { message: "Tecnologia eliminada correctamente" }
}
