import multer from "multer"
import path from "path"
import fs from "fs"
import { randomUUID } from "crypto"

export const PROFILE_IMAGES_DIR = path.join(process.cwd(), "uploads", "profile-images")

if (!fs.existsSync(PROFILE_IMAGES_DIR)) {
    fs.mkdirSync(PROFILE_IMAGES_DIR, { recursive: true })
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, PROFILE_IMAGES_DIR)
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase()
        cb(null, `${randomUUID()}${ext}`)
    },
})

export const uploadProfileImage = multer({
    storage,
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
