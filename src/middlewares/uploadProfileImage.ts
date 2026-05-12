import multer from "multer"

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]

export const uploadProfileImage = multer({
    storage: multer.memoryStorage(),
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error("Solo se permiten imagenes JPEG, PNG o WEBP"))
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
})
