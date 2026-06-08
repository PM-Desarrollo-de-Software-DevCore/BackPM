import { createProfileChangeRequest } from "../../infrastructure/repositories/ProfileChangeRequestRepository"
import { findUserById } from "../../infrastructure/repositories/UserRepository"
import { notifyProfileChangeRequested } from "../../infrastructure/services/notificationService"
import { ProfileChangeFields, ProfileChangeRequest } from "../../entities/ProfileChangeRequest"

// Campos del perfil que el usuario puede solicitar cambiar (whitelist).
// password, globalRole, id, createdAt y profileImageUrl/cvUrl quedan fuera a proposito.
const ALLOWED_FIELDS = ["name", "lastname", "email", "skill", "area"] as const
type AllowedField = typeof ALLOWED_FIELDS[number]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const sanitizeChanges = (input: Record<string, unknown>): ProfileChangeFields => {
    const out: ProfileChangeFields = {}

    for (const key of Object.keys(input)) {
        if (!ALLOWED_FIELDS.includes(key as AllowedField)) {
            throw new Error(`Campo no permitido en la solicitud: ${key}`)
        }
        const value = input[key]

        if (key === "name" || key === "lastname") {
            if (typeof value !== "string" || value.trim().length === 0) {
                throw new Error(`El campo ${key} debe ser un texto no vacío`)
            }
            out[key] = value.trim()
        } else if (key === "email") {
            if (typeof value !== "string" || !EMAIL_REGEX.test(value.trim())) {
                throw new Error("El email no es válido")
            }
            out.email = value.trim().toLowerCase()
        } else if (key === "skill" || key === "area") {
            if (value === null) {
                out[key] = null
            } else if (typeof value === "string") {
                out[key] = value.trim() === "" ? null : value.trim()
            } else {
                throw new Error(`El campo ${key} debe ser texto o null`)
            }
        }
    }

    if (Object.keys(out).length === 0) {
        throw new Error("Debes incluir al menos un campo a modificar")
    }

    return out
}

export const createProfileChangeRequestUseCase = async (
    userId: string,
    rawChanges: Record<string, unknown>
): Promise<ProfileChangeRequest> => {
    const user = await findUserById(userId)
    if (!user) {
        throw new Error("Usuario no encontrado")
    }

    const proposedChanges = sanitizeChanges(rawChanges ?? {})

    const created = await createProfileChangeRequest({
        id_user: userId,
        proposedChanges
    })

    await notifyProfileChangeRequested(created.id_request, userId, created.proposedChanges)

    return created
}
