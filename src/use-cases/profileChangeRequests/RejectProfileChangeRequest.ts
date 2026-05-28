import {
    getProfileChangeRequestById,
    updateProfileChangeRequestStatus
} from "../../infrastructure/repositories/ProfileChangeRequestRepository"
import { findUserById } from "../../infrastructure/repositories/UserRepository"
import { notifyProfileChangeRejected } from "../../infrastructure/services/notificationService"
import { ProfileChangeRequest, ProfileChangeRequestStatus } from "../../entities/ProfileChangeRequest"
import { GlobalRole } from "../../entities/User"

export const rejectProfileChangeRequestUseCase = async (
    requestId: string,
    actorUserId: string,
    reviewNote: string | null
): Promise<ProfileChangeRequest> => {
    const actor = await findUserById(actorUserId)
    if (!actor || actor.globalRole !== GlobalRole.ADMIN) {
        throw new Error("Solo un administrador puede rechazar solicitudes")
    }

    const request = await getProfileChangeRequestById(requestId)
    if (!request) {
        throw new Error("Solicitud no encontrada")
    }
    if (request.status !== ProfileChangeRequestStatus.PENDING) {
        throw new Error("La solicitud no está pendiente")
    }

    const note = reviewNote && reviewNote.trim().length > 0 ? reviewNote.trim() : null
    const reviewedAt = new Date()

    await updateProfileChangeRequestStatus(requestId, {
        status: ProfileChangeRequestStatus.REJECTED,
        reviewedBy: actorUserId,
        reviewNote: note,
        reviewedAt
    })

    await notifyProfileChangeRejected(requestId, request.id_user, actorUserId, note)

    return {
        ...request,
        status: ProfileChangeRequestStatus.REJECTED,
        reviewedBy: actorUserId,
        reviewNote: note,
        reviewedAt
    }
}
