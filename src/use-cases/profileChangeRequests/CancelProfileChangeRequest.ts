import {
    getProfileChangeRequestById,
    updateProfileChangeRequestStatus
} from "../../infrastructure/repositories/ProfileChangeRequestRepository"
import { notifyProfileChangeCancelled } from "../../infrastructure/services/notificationService"
import { ProfileChangeRequest, ProfileChangeRequestStatus } from "../../entities/ProfileChangeRequest"

export const cancelProfileChangeRequestUseCase = async (
    requestId: string,
    actorUserId: string
): Promise<ProfileChangeRequest> => {
    const request = await getProfileChangeRequestById(requestId)
    if (!request) {
        throw new Error("Solicitud no encontrada")
    }
    if (request.id_user !== actorUserId) {
        throw new Error("Solo el dueño de la solicitud puede cancelarla")
    }
    if (request.status !== ProfileChangeRequestStatus.PENDING) {
        throw new Error("Solo se pueden cancelar solicitudes pendientes")
    }

    const reviewedAt = new Date()
    await updateProfileChangeRequestStatus(requestId, {
        status: ProfileChangeRequestStatus.CANCELLED,
        reviewedBy: null,
        reviewNote: null,
        reviewedAt
    })

    await notifyProfileChangeCancelled(requestId, actorUserId)

    return {
        ...request,
        status: ProfileChangeRequestStatus.CANCELLED,
        reviewedAt
    }
}
