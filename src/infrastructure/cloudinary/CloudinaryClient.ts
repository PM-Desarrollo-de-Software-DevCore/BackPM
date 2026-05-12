import { v2 as cloudinary, UploadApiResponse } from "cloudinary"
import { CLOUDINARY_URL } from "../../config/env"

if (!CLOUDINARY_URL) {
    throw new Error("CLOUDINARY_URL no esta definida. Agregala al .env con formato cloudinary://API_KEY:API_SECRET@CLOUD_NAME y reinicia el servidor.")
}

const match = CLOUDINARY_URL.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/)
if (!match) {
    throw new Error(`CLOUDINARY_URL tiene formato invalido. Esperado: cloudinary://API_KEY:API_SECRET@CLOUD_NAME (recibido: "${CLOUDINARY_URL.slice(0, 20)}...")`)
}

const [, api_key, api_secret, cloud_name] = match

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
