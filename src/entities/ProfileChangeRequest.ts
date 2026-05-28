export enum ProfileChangeRequestStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    CANCELLED = "cancelled"
}

// Campos del perfil que el usuario puede pedir modificar (subset de User).
// profileImageUrl tiene su propio flujo (upload directo a Cloudinary) y no entra aqui.
// password, globalRole, id, createdAt nunca son solicitables.
export interface ProfileChangeFields {
    name?: string
    lastname?: string
    email?: string
    skill?: string | null
    area?: string | null
}

export interface ProfileChangeRequest {
    id_request: string
    id_user: string
    proposedChanges: ProfileChangeFields
    status: ProfileChangeRequestStatus
    reviewedBy: string | null
    reviewNote: string | null
    createdAt: Date
    reviewedAt: Date | null
}
