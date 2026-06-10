import { Request, Response } from "express"
import bcrypt from "bcrypt"
import { findUsersPage, saveUser, updateUser, findUserById } from "../infrastructure/repositories/UserRepository"
import { deleteUserUseCase, isGhostUserEmail } from "../use-cases/users/DeleteUser"
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

const MAX_PAGE_SIZE = 100

// Entero positivo o undefined si el query param no viene o es invalido
// (mismo criterio que parseLimit del leaderboard).
const parsePositiveInt = (raw: unknown): number | undefined => {
  if (raw === undefined) return undefined
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return undefined
  return Math.floor(n)
}

export const listUsersController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let isAdmin = false
    if (req.userId) {
      const me = await getCurrentUser(req.userId)
      isAdmin = me.role === "admin"
    }

    const pageParam = parsePositiveInt(req.query.page)
    const limitParam = parsePositiveInt(req.query.limit)
    // Paginacion OPT-IN: sin page/limit se devuelve el directorio completo
    // (toda la UI pagina/filtra/busca en cliente y espera el universo completo).
    const paginate = pageParam !== undefined || limitParam !== undefined
    const page = pageParam ?? 1
    const limit = limitParam !== undefined ? Math.min(limitParam, MAX_PAGE_SIZE) : MAX_PAGE_SIZE

    // Proyeccion SQL segun rol: admin recibe phoneNumber/cvUrl; no-admin el directorio sin PII.
    const { items, total } = await findUsersPage({
      includePrivate: isAdmin,
      skip: paginate ? (page - 1) * limit : undefined,
      take: paginate ? limit : undefined,
    })

    // data sigue siendo el arreglo (lo que el front desenvuelve); total/page/limit son aditivos.
    res.status(200).json({
      success: true,
      data: items,
      total,
      page: paginate ? page : 1,
      limit: paginate ? limit : total,
    })
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
    // Reconsultamos para no devolver el hash de password de la entidad recien guardada
    res.status(201).json({ success: true, data: await findUserById(created.id) })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const updateUserController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id)
    const data = req.body

    // La cuenta del sistema (ghost) no se puede modificar.
    const target = await findUserById(id)
    if (target && isGhostUserEmail(target.email)) {
      return res.status(400).json({ success: false, message: "No se puede modificar la cuenta del sistema" })
    }

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
    // Reasigna historial al perfil ghost y deja lo pendiente sin asignar; la
    // guarda contra la cuenta del sistema vive dentro del use-case.
    await deleteUserUseCase(id)
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
