import { AppDataSource } from "../db/DataSource"
import { ProfileChangeRequestEntity } from "../db/entities/ProfileChangeRequestEntity"
import {
    ProfileChangeRequest,
    ProfileChangeRequestStatus,
    ProfileChangeFields
} from "../../entities/ProfileChangeRequest"

const repo = AppDataSource.getRepository(ProfileChangeRequestEntity)

const toDomain = (row: ProfileChangeRequestEntity): ProfileChangeRequest => ({
    id_request: row.id_request,
    id_user: row.id_user,
    proposedChanges: row.proposedChanges ? JSON.parse(row.proposedChanges) : {},
    status: row.status,
    reviewedBy: row.reviewedBy,
    reviewNote: row.reviewNote,
    createdAt: row.createdAt,
    reviewedAt: row.reviewedAt
})

export const createProfileChangeRequest = async (data: {
    id_user: string
    proposedChanges: ProfileChangeFields
}): Promise<ProfileChangeRequest> => {
    const entity = repo.create({
        id_user: data.id_user,
        proposedChanges: JSON.stringify(data.proposedChanges),
        status: ProfileChangeRequestStatus.PENDING,
        reviewedBy: null,
        reviewNote: null,
        reviewedAt: null
    })
    const saved = await repo.save(entity)
    return toDomain(saved)
}

export const getProfileChangeRequestById = async (id: string): Promise<ProfileChangeRequest | null> => {
    const row = await repo.findOne({ where: { id_request: id } })
    return row ? toDomain(row) : null
}

export const getProfileChangeRequestsByUser = async (userId: string): Promise<ProfileChangeRequest[]> => {
    const rows = await repo.find({
        where: { id_user: userId },
        order: { createdAt: "DESC" }
    })
    return rows.map(toDomain)
}

export interface ProfileChangeRequestFilters {
    status?: ProfileChangeRequestStatus
}

export const getAllProfileChangeRequests = async (
    filters: ProfileChangeRequestFilters = {}
): Promise<ProfileChangeRequest[]> => {
    const qb = repo.createQueryBuilder("r")
    if (filters.status) {
        qb.where("r.status = :status", { status: filters.status })
    }
    return (await qb.orderBy("r.createdAt", "DESC").getMany()).map(toDomain)
}

export const updateProfileChangeRequestStatus = async (
    id: string,
    data: {
        status: ProfileChangeRequestStatus
        reviewedBy: string | null
        reviewNote: string | null
        reviewedAt: Date | null
    }
): Promise<void> => {
    await repo.update(
        { id_request: id },
        {
            status: data.status,
            reviewedBy: data.reviewedBy,
            reviewNote: data.reviewNote,
            reviewedAt: data.reviewedAt
        }
    )
}
