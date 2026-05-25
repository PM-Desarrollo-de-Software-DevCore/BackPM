import { Request, Response } from "express"
import bcrypt from "bcrypt"
import { findAllUsers, saveUser, updateUser, deleteUser, findUserById } from "../infrastructure/repositories/UserRepository"
import { uploadProfileImage, deleteProfileImage, uploadCV, deleteCV, getCVSignedUrl } from "../infrastructure/cloudinary/CloudinaryClient"
import { Specialty } from "../entities/User"
import { AuthenticatedRequest } from "../middlewares/requireAuth"
import { getCurrentUser } from "../use-cases/auth/GetCurrentUser"
import { notifyAdminUserChange } from "../infrastructure/services/notificationService"
import { NotificationCategory } from "../entities/Notification"

const SPECIALTY_VALUES = Object.values(Specialty) as string[]

const validateSpecialty = (value: unknown): { ok: true } | { ok: false; message: string } => {
  if (value === undefined || value === null) return { ok: true }
  if (typeof value !== "string" || !SPECIALTY_VALUES.includes(value)) {
    return { ok: false, message: `specialty invalida. Valores permitidos: ${SPECIALTY_VALUES.join(", ")}` }
  }
  return { ok: true }
}

export const listUsersController = async (req: Request, res: Response) => {
  try {
    const users = await findAllUsers()
    res.status(200).json({ success: true, data: users })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const createUserController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body
    if (Array.isArray(data.area)) {
      data.area = data.area.join(", ")
    }
    const specialtyCheck = validateSpecialty(data.specialty)
    if (!specialtyCheck.ok) {
      return res.status(400).json({ success: false, message: specialtyCheck.message })
    }
    // If password provided, hash it so admin-created users store hashed passwords
    if (data.password) {
      const hashed = await bcrypt.hash(String(data.password), 10)
      data.password = hashed
    }
    const created = await saveUser(data)
    if (req.userId) {
      const actor = await getCurrentUser(req.userId)
      if (actor.role === "admin") {
        await notifyAdminUserChange({
          actorUserId: req.userId,
          category: NotificationCategory.ADMIN_USER_CREATED,
          title: "Usuario creado",
          actionVerb: "creó el usuario",
          targetName: `${created.name} ${created.lastname}`,
        })
      }
    }
    res.status(201).json({ success: true, data: created })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const updateUserController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id)
    const data = req.body
    if (Array.isArray(data.area)) {
      data.area = data.area.join(", ")
    }
    const specialtyCheck = validateSpecialty(data.specialty)
    if (!specialtyCheck.ok) {
      return res.status(400).json({ success: false, message: specialtyCheck.message })
    }
    // If password being updated, hash it before saving
    if (data.password) {
      const hashed = await bcrypt.hash(String(data.password), 10)
      data.password = hashed
    }
    const previous = await findUserById(id)
    await updateUser(id, data)
    const updated = await findUserById(id)
    if (req.userId) {
      const actor = await getCurrentUser(req.userId)
      if (actor.role === "admin" && previous && updated) {
        await notifyAdminUserChange({
          actorUserId: req.userId,
          category: NotificationCategory.ADMIN_USER_UPDATED,
          title: "Usuario actualizado",
          actionVerb: "actualizó el usuario",
          targetName: `${updated.name} ${updated.lastname}`,
        })
      }
    }
    res.status(200).json({ success: true, data: updated })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const deleteUserController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id)
    const previous = await findUserById(id)
    await deleteUser(id)
    if (req.userId && previous) {
      const actor = await getCurrentUser(req.userId)
      if (actor.role === "admin") {
        await notifyAdminUserChange({
          actorUserId: req.userId,
          category: NotificationCategory.ADMIN_USER_DELETED,
          title: "Usuario eliminado",
          actionVerb: "eliminó el usuario",
          targetName: `${previous.name} ${previous.lastname}`,
        })
      }
    }
    res.status(200).json({ success: true })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const uploadProfileImageController = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No se recibio ningun archivo" })
    }

    const id = String(req.params.id)
    const user = await findUserById(id)
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" })
    }

    const uploaded = await uploadProfileImage(req.file.buffer, id)

    await updateUser(id, { profileImageUrl: uploaded.secure_url })
    const updated = await findUserById(id)
    return res.status(200).json({ success: true, data: updated })
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const deleteProfileImageController = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id)
    const user = await findUserById(id)
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" })
    }

    if (user.profileImageUrl) {
      await deleteProfileImage(id)
    }
    await updateUser(id, { profileImageUrl: null })
    const updated = await findUserById(id)
    return res.status(200).json({ success: true, data: updated })
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const uploadCVController = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No se recibio ningun archivo" })
    }

    const id = String(req.params.id)
    const user = await findUserById(id)
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" })
    }

    const uploaded = await uploadCV(req.file.buffer, id)

    await updateUser(id, { cvUrl: uploaded.secure_url })
    const updated = await findUserById(id)
    return res.status(200).json({ success: true, data: updated })
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const getCVController = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id)
    const user = await findUserById(id)
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" })
    }

    if (!user.cvUrl) {
      return res.status(404).json({ success: false, message: "Usuario no tiene CV cargado" })
    }

    const { url, expiresAt } = getCVSignedUrl(id)
    return res.status(200).json({ success: true, data: { url, expiresAt } })
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const deleteCVController = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id)
    const user = await findUserById(id)
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" })
    }

    if (user.cvUrl) {
      await deleteCV(id)
    }
    await updateUser(id, { cvUrl: null })
    const updated = await findUserById(id)
    return res.status(200).json({ success: true, data: updated })
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message })
  }
}
