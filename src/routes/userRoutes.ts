import { Router } from "express"
import { listUsersController, createUserController, updateUserController, deleteUserController, uploadProfileImageController, deleteProfileImageController, uploadCVController, getCVController, deleteCVController } from "../controllers/userController"
import { getMyTasksController } from "../controllers/taskController"
import { requireAuth } from "../middlewares/requireAuth"
import { requireSelfOrAdmin } from "../middlewares/requireSelfOrAdmin"
import { requireAdmin } from "../middlewares/requireAdmin"
import { uploadProfileImage } from "../middlewares/uploadProfileImage"
import { uploadPDF } from "../middlewares/uploadPDF"

const router = Router()

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Listar usuarios
 *     description: |
 *       Devuelve el directorio de usuarios. Los admins reciben campos adicionales (`phoneNumber`, `cvUrl`);
 *       los no-admins reciben una proyeccion sin PII.
 *       Paginacion OPT-IN: sin `page` ni `limit` se devuelve el listado completo. Si se envia `page` y/o `limit`,
 *       se pagina en la base de datos (OFFSET/FETCH); `limit` se acota a un maximo de 100.
 *       La respuesta siempre trae `data` como arreglo, con `total`, `page` y `limit` como metadatos aditivos.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numero de pagina (1-based). Solo aplica si se envia page o limit.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Tamano de pagina (maximo 100). Si se omite junto con page, se devuelven todos los usuarios.
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *                   description: Total de usuarios (sin paginar)
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                   description: Tamano de pagina aplicado. Cuando no se pagina (sin page/limit), refleja el total devuelto.
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */
// List users (requires auth)
router.get("/", requireAuth, listUsersController)

/**
 * @swagger
 * /users/me/tasks:
 *   get:
 *     summary: Listar tareas asignadas al usuario autenticado
 *     description: |
 *       Devuelve la lista plana de tareas donde `assignedTo` es el usuario autenticado.
 *       Soporta filtros opcionales por `status` y `priority`.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed]
 *       - in: query
 *         name: priority
 *         required: false
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: Lista de tareas asignadas al usuario
 *       400:
 *         description: Filtros invalidos
 *       401:
 *         description: No autorizado
 */
router.get("/me/tasks", requireAuth, getMyTasksController)

// Crear usuario: solo admins (el alta de cuenta propia va por POST /auth/register).
router.post("/", requireAuth, requireAdmin, createUserController)

// Actualizar usuario: solo admins. Los usuarios normales piden cambios de su
// perfil via POST /profile-change-requests (requiere aprobacion de un admin).
router.put("/:id", requireAuth, requireAdmin, updateUserController)

// Eliminar usuario: solo admins.
router.delete("/:id", requireAuth, requireAdmin, deleteUserController)

/**
 * @swagger
 * /users/{id}/profile-image:
 *   post:
 *     summary: Subir o reemplazar imagen de perfil del usuario
 *     description: |
 *       Sube una imagen de perfil para el usuario indicado. Reemplaza la imagen anterior si existia.
 *       Acepta JPEG, PNG o WEBP. Tamano maximo 5 MB.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagen de perfil actualizada
 *       400:
 *         description: Archivo invalido o no enviado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.post("/:id/profile-image", requireAuth, requireSelfOrAdmin(), uploadProfileImage.single("image"), uploadProfileImageController)

/**
 * @swagger
 * /users/{id}/profile-image:
 *   delete:
 *     summary: Eliminar imagen de perfil del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Imagen de perfil eliminada
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.delete("/:id/profile-image", requireAuth, requireSelfOrAdmin(), deleteProfileImageController)

/**
 * @swagger
 * /users/{id}/cv:
 *   post:
 *     summary: Subir o reemplazar el CV del usuario
 *     description: |
 *       Sube un CV en PDF para el usuario indicado. Reemplaza el CV anterior si existia.
 *       Solo PDF. Tamano maximo 10 MB. Acceso restringido al propio usuario o admins.
 *       El archivo se guarda como recurso autenticado en Cloudinary; el URL crudo no es accesible publicamente.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: CV subido correctamente
 *       400:
 *         description: Archivo invalido o no enviado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permiso (no es dueno ni admin)
 *       404:
 *         description: Usuario no encontrado
 */
router.post("/:id/cv", requireAuth, requireSelfOrAdmin(), uploadPDF.single("file"), uploadCVController)

/**
 * @swagger
 * /users/{id}/cv:
 *   get:
 *     summary: Obtener URL firmado para descargar/ver el CV
 *     description: |
 *       Devuelve un URL firmado con expiracion (1 hora) para acceder al PDF.
 *       Solo el dueno o un admin pueden solicitarlo. El URL es de uso unico temporal — si expira, pedir uno nuevo.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: URL firmado generado
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
 *                     url:
 *                       type: string
 *                       description: URL firmado de Cloudinary
 *                     expiresAt:
 *                       type: integer
 *                       description: Unix timestamp de expiracion
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permiso (no es dueno ni admin)
 *       404:
 *         description: Usuario no encontrado o sin CV cargado
 */
router.get("/:id/cv", requireAuth, requireSelfOrAdmin(), getCVController)

/**
 * @swagger
 * /users/{id}/cv:
 *   delete:
 *     summary: Eliminar el CV del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CV eliminado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permiso (no es dueno ni admin)
 *       404:
 *         description: Usuario no encontrado
 */
router.delete("/:id/cv", requireAuth, requireSelfOrAdmin(), deleteCVController)

export default router
