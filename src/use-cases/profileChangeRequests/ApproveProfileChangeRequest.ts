import {
    getProfileChangeRequestById,
    updateProfileChangeRequestStatus
} from "../../infrastructure/repositories/ProfileChangeRequestRepository"
import { findUserById, findUserByEmail, updateUser } from "../../infrastructure/repositories/UserRepository"
import { notifyProfileChangeApproved } from "../../infrastructure/services/notificationService"
import { ProfileChangeRequest, ProfileChangeRequestStatus } from "../../entities/ProfileChangeRequest"
import { GlobalRole } from "../../entities/User"

export const approveProfileChangeRequestUseCase = async (
    requestId: string,
    actorUserId: string
): Promise<ProfileChangeRequest> => {
    const actor = await findUserById(actorUserId)
    if (!actor || actor.globalRole !== GlobalRole.ADMIN) {
        throw new Error("Solo un administrador puede aprobar solicitudes")
    }

    const request = await getProfileChangeRequestById(requestId)
    if (!request) {
        throw new Error("Solicitud no encontrada")
    }
    if (request.status !== ProfileChangeRequestStatus.PENDING) {
        throw new Error("La solicitud no está pendiente")
    }

    const target = await findUserById(request.id_user)
    if (!target) {
        throw new Error("El usuario solicitante ya no existe")
    }

    // Si el cambio incluye email, validar unicidad (otro usuario no puede tener ya ese email).
    if (request.proposedChanges.email && request.proposedChanges.email !== target.email) {
        const collision = await findUserByEmail(request.proposedChanges.email)
        if (collision && collision.id !== target.id) {
            throw new Error("El email ya está en uso por otro usuario")
        }
    }

    await updateUser(request.id_user, request.proposedChanges)

    const reviewedAt = new Date()
    await updateProfileChangeRequestStatus(requestId, {
        status: ProfileChangeRequestStatus.APPROVED,
        reviewedBy: actorUserId,
        reviewNote: null,
        reviewedAt
    })

    await notifyProfileChangeApproved(requestId, request.id_user, actorUserId)

    return {
        ...request,
        status: ProfileChangeRequestStatus.APPROVED,
        reviewedBy: actorUserId,
        reviewNote: null,
        reviewedAt
    }
}
