import { v2 as cloudinary, UploadApiResponse } from "cloudinary"
import { CLOUDINARY_URL } from "../../config/env"

if (!CLOUDINARY_URL) {
    throw new Error("CLOUDINARY_URL no esta definida. Agregala al .env con formato cloudinary://API_KEY:API_SECRET@CLOUD_NAME y reinicia el servidor.")
}

const match = CLOUDINARY_URL.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/)
if (!match) {
    throw new Error(`CLOUDINARY_URL tiene formato invalido. Esperado: cloudinary://API_KEY:API_SECRET@CLOUD_NAME (recibido: "${CLOUDINARY_URL.slice(0, 20)}...")`)
}

const api_key = match[1]!
const api_secret = match[2]!
const cloud_name = match[3]!

cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
})

const PROFILE_IMAGE_FOLDER = "profile-images"

const profileImagePublicId = (userId: string) => `${PROFILE_IMAGE_FOLDER}/${userId}`

export const uploadProfileImage = async (
    buffer: Buffer,
    userId: string,
): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                public_id: profileImagePublicId(userId),
                overwrite: true,
                invalidate: true,
                resource_type: "image",
            },
            (err, result) => {
                if (err) return reject(err)
                if (!result) return reject(new Error("Cloudinary devolvio respuesta vacia"))
                resolve(result)
            },
        )
        stream.end(buffer)
    })
}

export const deleteProfileImage = async (userId: string) => {
    return cloudinary.uploader.destroy(profileImagePublicId(userId), {
        invalidate: true,
        resource_type: "image",
    })
}

const CV_FOLDER = "cv"

const cvPublicId = (userId: string) => `${CV_FOLDER}/${userId}.pdf`

export const uploadCV = async (
    buffer: Buffer,
    userId: string,
): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                public_id: cvPublicId(userId),
                overwrite: true,
                invalidate: true,
                resource_type: "raw",
                type: "authenticated",
            },
            (err, result) => {
                if (err) return reject(err)
                if (!result) return reject(new Error("Cloudinary devolvio respuesta vacia"))
                resolve(result)
            },
        )
        stream.end(buffer)
    })
}

export const deleteCV = async (userId: string) => {
    return cloudinary.uploader.destroy(cvPublicId(userId), {
        invalidate: true,
        resource_type: "raw",
        type: "authenticated",
    })
}

export const getCVSignedUrl = (
    userId: string,
    expiresInSeconds = 3600,
): { url: string; expiresAt: number } => {
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds
    const url = cloudinary.utils.private_download_url(
        cvPublicId(userId),
        "",
        {
            resource_type: "raw",
            type: "authenticated",
            expires_at: expiresAt,
        },
    )
    return { url, expiresAt }
}
