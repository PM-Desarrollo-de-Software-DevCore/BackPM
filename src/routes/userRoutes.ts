import { Router } from "express"
import { listUsersController, createUserController, updateUserController, deleteUserController } from "../controllers/userController"
import { requireAuth } from "../middlewares/requireAuth"

const router = Router()

// List users (requires auth)
router.get("/", requireAuth, listUsersController)

// Create user (admin or open depending on your policy)
router.post("/", requireAuth, createUserController)

// Update user
router.put("/:id", requireAuth, updateUserController)

// Delete user
router.delete("/:id", requireAuth, deleteUserController)

export default router
