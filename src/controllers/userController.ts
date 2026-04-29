import { Request, Response } from "express"
import bcrypt from "bcrypt"
import { findAllUsers, saveUser, updateUser, deleteUser, findUserById } from "../infrastructure/repositories/UserRepository"

export const listUsersController = async (req: Request, res: Response) => {
  try {
    const users = await findAllUsers()
    res.status(200).json({ success: true, data: users })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const createUserController = async (req: Request, res: Response) => {
  try {
    const data = req.body
    if (Array.isArray(data.area)) {
      data.area = data.area.join(", ")
    }
    // If password provided, hash it so admin-created users store hashed passwords
    if (data.password) {
      const hashed = await bcrypt.hash(String(data.password), 10)
      data.password = hashed
    }
    const created = await saveUser(data)
    res.status(201).json({ success: true, data: created })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id)
    const data = req.body
    if (Array.isArray(data.area)) {
      data.area = data.area.join(", ")
    }
    // If password being updated, hash it before saving
    if (data.password) {
      const hashed = await bcrypt.hash(String(data.password), 10)
      data.password = hashed
    }
    await updateUser(id, data)
    const updated = await findUserById(id)
    res.status(200).json({ success: true, data: updated })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id)
    await deleteUser(id)
    res.status(200).json({ success: true })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}
