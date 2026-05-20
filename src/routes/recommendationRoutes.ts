import { Router } from "express"
import { requireAuth } from "../middlewares/requireAuth"
import { recommendAssigneesController } from "../controllers/recommendationController"

const router = Router()

router.post("/assignment-suggestions", requireAuth, recommendAssigneesController)

export default router