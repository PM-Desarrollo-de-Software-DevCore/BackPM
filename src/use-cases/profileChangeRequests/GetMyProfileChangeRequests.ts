import { getProfileChangeRequestsByUser } from "../../infrastructure/repositories/ProfileChangeRequestRepository"
import { ProfileChangeRequest } from "../../entities/ProfileChangeRequest"

export const getMyProfileChangeRequestsUseCase = async (userId: string): Promise<ProfileChangeRequest[]> => {
    return await getProfileChangeRequestsByUser(userId)
}
