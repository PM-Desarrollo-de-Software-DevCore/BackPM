import { Router } from "express";
import { validateLogin } from "../middlewares/validateLogin";
import { registerController, loginController, meController, forgotPasswordController, resetPasswordController, uploadCVController } from "../controllers/authController";
import { validateRegister } from "../middlewares/validateRegister";
import { requireAuth } from "../middlewares/requireAuth";
import { validateResetPassword } from "../middlewares/validateResetPassword";
import { uploadPDF } from "../middlewares/uploadPDF";

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
 *               globalRole:
 *                 type: string
 *                 enum: [admin, user]
 *                 example: "user"
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

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicitar reseteo de contraseña
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
 *     responses:
 *       200:
 *         description: Email de reseteo enviado
 */
router.post("/forgot-password", forgotPasswordController)

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Resetear contraseña con token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resetToken:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña reseteada
 */
router.post("/reset-password", validateResetPassword, resetPasswordController)

/**
 * @swagger
 * /auth/upload-cv:
 *   post:
 *     summary: Subir y procesar CV en PDF
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF file containing the CV
 *     responses:
 *       200:
 *         description: CV processed successfully, returns extracted data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: string
 *                     tools:
 *                       type: array
 *                       items:
 *                         type: string
 *                     soft_skills:
 *                       type: array
 *                       items:
 *                         type: string
 *                     experience_areas:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Invalid file or processing error
 */
router.post("/upload-cv", uploadPDF.single('file'), uploadCVController)

export default router