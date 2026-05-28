import { getAllProfileChangeRequests, ProfileChangeRequestFilters } from "../../infrastructure/repositories/ProfileChangeRequestRepository"
import { findUserById } from "../../infrastructure/repositories/UserRepository"
import { ProfileChangeRequest, ProfileChangeRequestStatus } from "../../entities/ProfileChangeRequest"
import { GlobalRole } from "../../entities/User"

export const getAllProfileChangeRequestsUseCase = async (
    actorUserId: string,
    filters: { status?: string } = {}
): Promise<ProfileChangeRequest[]> => {
    const actor = await findUserById(actorUserId)
    if (!actor || actor.globalRole !== GlobalRole.ADMIN) {
        throw new Error("Solo un administrador puede listar las solicitudes")
    }

    const repoFilters: ProfileChangeRequestFilters = {}
    if (filters.status) {
        if (!Object.values(ProfileChangeRequestStatus).includes(filters.status as ProfileChangeRequestStatus)) {
            throw new Error("Status inválido (pending | approved | rejected | cancelled)")
        }
        repoFilters.status = filters.status as ProfileChangeRequestStatus
    }

    return await getAllProfileChangeRequests(repoFilters)
}
