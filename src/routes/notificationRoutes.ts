import { Router } from "express"
import { requireAuth } from "../middlewares/requireAuth"
import { getMyNotificationsController, markMyNotificationsAsReadController } from "../controllers/notificationController"

const router = Router()

router.get("/me", requireAuth, getMyNotificationsController)
router.patch("/me/read-all", requireAuth, markMyNotificationsAsReadController)

export default router