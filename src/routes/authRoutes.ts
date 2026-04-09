import { Router } from "express";
import { validateLogin } from "../middlewares/validateLogin";
import { registerController, loginController, meController } from "../controllers/authController";
import { validateRegister } from "../middlewares/validateRegister";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router()


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan@gmail.com
 *               password:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve el token
 *       401:
 *         description: Credenciales inválidas
 */
router.post("/login", validateLogin, loginController)

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registro de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan@gmail.com
 *               password:
 *                 type: string
 *                 example: "1234"
 *               name:
 *                 type: string
 *                 example: "Pancho" 
 *               lastname:
 *                 type: string
 *                 example: "Pantera"
 *               role: 
 *                 type: string
 *                 example: "developer"
 * 
 *     responses:
 *       200:
 *         description: Registro exitoso, devuelve los datos de registro
 *       401:
 *         description: Registro fallido
 */
router.post("/register", validateRegister, registerController)

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener el usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario autenticado
 *       401:
 *         description: Token inválido o no proporcionado
 */
router.get("/me", requireAuth, meController)

export default router