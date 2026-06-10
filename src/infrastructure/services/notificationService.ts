import { NotificationCategory } from "../../entities/Notification"
import { ProfileChangeFields } from "../../entities/ProfileChangeRequest"
import { createNotification, createNotifications, countUnreadNotifications, getNotificationsForUser, hasNotificationDedupeKey, markAllNotificationsAsRead } from "../repositories/NotificationRepository"
import { findAllUsers, findUserById } from "../repositories/UserRepository"
import { getProjectById } from "../repositories/ProjectRepository"
import { getTaskById, getTasksByAssignedUser } from "../repositories/TaskRepository"
import { getProjectMembers } from "../repositories/MemberProjectRepository"
import { getSprintById } from "../repositories/SprintRepository"

// Ventana (en días) para avisar de tareas próximas a vencer.
const DUE_SOON_DAYS = 3

const fullName = (name?: string | null, lastname?: string | null) => [name, lastname].filter(Boolean).join(" ") || "Usuario"

// Etiquetas legibles para los campos que un usuario puede solicitar cambiar.
const PROFILE_FIELD_LABELS: Record<string, string> = {
    name: "Nombre",
    lastname: "Apellido",
    email: "Correo",
    skill: "Habilidad",
    area: "Área",
}

const formatProfileValue = (value: unknown): string => {
    if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) {
        return "(vacío)"
    }
    return String(value)
}

// Construye un resumen legible de los cambios solicitados, mostrando
// valor actual -> valor propuesto cuando el campo ya tenía un valor.
const describeProfileChanges = (
    changes: ProfileChangeFields,
    current?: { name?: string | null; lastname?: string | null; email?: string | null; skill?: string | null; area?: string | null } | null
): string => {
    return Object.entries(changes)
        .map(([field, value]) => {
            const label = PROFILE_FIELD_LABELS[field] ?? field
            const next = formatProfileValue(value)
            const prev = current ? formatProfileValue((current as Record<string, unknown>)[field]) : "(vacío)"
            return prev === "(vacío)" ? `${label}: ${next}` : `${label}: ${prev} → ${next}`
        })
        .join(", ")
}

const notifyAdmins = async (data: {
    actorUserId: string | null
    category: NotificationCategory
    title: string
    message: string
    relatedType?: string | null
    relatedId?: string | null
}) => {
    const admins = (await findAllUsers()).filter((user) => user.globalRole === "admin")
    await createNotifications(admins.map((admin) => ({
        recipientUserId: admin.id,
        actorUserId: data.actorUserId,
        category: data.category,
        title: data.title,
        message: data.message,
        relatedType: data.relatedType ?? null,
        relatedId: data.relatedId ?? null,
    })))
}

// Notifica a todos los miembros de un proyecto, omitiendo al actor (quien
// disparó el evento) para evitar auto-notificaciones redundantes.
const notifyProjectMembers = async (data: {
    projectId: string
    actorUserId: string | null
    category: NotificationCategory
    title: string
    message: string
    relatedType?: string | null
    relatedId?: string | null
}) => {
    const members = await getProjectMembers(data.projectId)
    const recipientIds = Array.from(
        new Set(members.map((member) => member.id_user).filter((id) => id && id !== data.actorUserId))
    )

    await createNotifications(recipientIds.map((recipientUserId) => ({
        recipientUserId,
        actorUserId: data.actorUserId,
        category: data.category,
        title: data.title,
        message: data.message,
        relatedType: data.relatedType ?? null,
        relatedId: data.relatedId ?? null,
    })))
}

export const notifyProjectCreated = async (projectId: string, actorUserId: string) => {
    const [actor, project] = await Promise.all([
        findUserById(actorUserId),
        getProjectById(projectId),
    ])

    if (!project) return

    await notifyAdmins({
        actorUserId,
        category: NotificationCategory.PROJECT_CREATED,
        title: "Nuevo proyecto creado",
        message: `${fullName(actor?.name, actor?.lastname)} creó el proyecto ${project.name}.`,
        relatedType: "project",
        relatedId: project.id_project,
    })
}

export const notifyProjectCompleted = async (projectId: string, actorUserId: string) => {
    const [actor, project] = await Promise.all([
        findUserById(actorUserId),
        getProjectById(projectId),
    ])

    if (!project) return

    const message = `${fullName(actor?.name, actor?.lastname)} marcó como finalizado el proyecto ${project.name}.`

    // Admins (cualquier proyecto) + miembros del proyecto donde participan.
    await notifyAdmins({
        actorUserId,
        category: NotificationCategory.PROJECT_COMPLETED,
        title: "Proyecto finalizado",
        message,
        relatedType: "project",
        relatedId: project.id_project,
    })

    await notifyProjectMembers({
        projectId: project.id_project,
        actorUserId,
        category: NotificationCategory.PROJECT_COMPLETED,
        title: "Proyecto finalizado",
        message: `El proyecto ${project.name} en el que participas fue marcado como finalizado.`,
        relatedType: "project",
        relatedId: project.id_project,
    })
}

// Notifica a los miembros del proyecto cuando un sprint se marca como finalizado.
export const notifySprintCompleted = async (sprintId: string, actorUserId: string) => {
    const sprint = await getSprintById(sprintId)
    if (!sprint) return

    const project = await getProjectById(sprint.id_project)
    if (!project) return

    await notifyProjectMembers({
        projectId: project.id_project,
        actorUserId,
        category: NotificationCategory.SPRINT_COMPLETED,
        title: "Sprint completado",
        message: `El sprint ${sprint.name} del proyecto ${project.name} fue marcado como completado.`,
        relatedType: "sprint",
        relatedId: sprint.id_sprint,
    })
}

// Notifica al usuario asignado cuando su tarea se marca como completada.
// Se omite si el propio asignado fue quien la completó (ya lo sabe).
export const notifyTaskCompleted = async (taskId: string, actorUserId: string) => {
    const task = await getTaskById(taskId)
    if (!task || !task.assignedTo || task.assignedTo === actorUserId) return

    const [project, actor, recipient] = await Promise.all([
        getProjectById(task.id_project),
        findUserById(actorUserId),
        findUserById(task.assignedTo),
    ])

    if (!project || !recipient) return

    await createNotification({
        recipientUserId: recipient.id,
        actorUserId,
        category: NotificationCategory.TASK_COMPLETED,
        title: "Tarea completada",
        message: `${fullName(actor?.name, actor?.lastname)} marcó como completada tu tarea ${task.title} en ${project.name}.`,
        relatedType: "task",
        relatedId: task.id_task,
    })
}

export const notifyProjectUpdated = async (projectId: string, actorUserId: string) => {
    const [actor, project] = await Promise.all([
        findUserById(actorUserId),
        getProjectById(projectId),
    ])

    if (!project) return

    await notifyAdmins({
        actorUserId,
        category: NotificationCategory.PROJECT_UPDATED,
        title: "Proyecto actualizado",
        message: `${fullName(actor?.name, actor?.lastname)} actualizó el proyecto ${project.name}.`,
        relatedType: "project",
        relatedId: project.id_project,
    })
}

export const notifyProjectDeleted = async (projectName: string, actorUserId: string) => {
    const actor = await findUserById(actorUserId)

    await notifyAdmins({
        actorUserId,
        category: NotificationCategory.PROJECT_DELETED,
        title: "Proyecto eliminado",
        message: `${fullName(actor?.name, actor?.lastname)} eliminó el proyecto ${projectName}.`,
        relatedType: "project",
        relatedId: null,
    })
}

export const notifyProjectMemberAdded = async (projectId: string, userId: string, actorUserId: string) => {
    const [project, actor, recipient] = await Promise.all([
        getProjectById(projectId),
        findUserById(actorUserId),
        findUserById(userId),
    ])

    if (!project || !recipient) return

    await createNotification({
        recipientUserId: recipient.id,
        actorUserId,
        category: NotificationCategory.PROJECT_MEMBER_ADDED,
        title: "Te agregaron a un proyecto",
        message: `${fullName(actor?.name, actor?.lastname)} te agregó al proyecto ${project.name}.`,
        relatedType: "project",
        relatedId: project.id_project,
    })
}

export const notifyTaskAssigned = async (taskId: string, assignedUserId: string | null, actorUserId: string) => {
    if (!assignedUserId) return

    const task = await getTaskById(taskId)
    if (!task) return

    const [project, actor, recipient] = await Promise.all([
        getProjectById(task.id_project),
        findUserById(actorUserId),
        findUserById(assignedUserId),
    ])

    if (!project || !recipient) return

    await createNotification({
        recipientUserId: recipient.id,
        actorUserId,
        category: NotificationCategory.TASK_ASSIGNED,
        title: "Tarea asignada",
        message: `${fullName(actor?.name, actor?.lastname)} te asignó la tarea ${task.title} en ${project.name}.`,
        relatedType: "task",
        relatedId: task.id_task,
    })
}

export const notifyTaskCommented = async (taskId: string, commenterUserId: string) => {
    const task = await getTaskById(taskId)
    if (!task || !task.assignedTo || task.assignedTo === commenterUserId) return

    const [project, commenter, recipient] = await Promise.all([
        getProjectById(task.id_project),
        findUserById(commenterUserId),
        findUserById(task.assignedTo),
    ])

    if (!project || !recipient) return

    await createNotification({
        recipientUserId: recipient.id,
        actorUserId: commenterUserId,
        category: NotificationCategory.TASK_COMMENTED,
        title: "Nuevo comentario en tu tarea",
        message: `${fullName(commenter?.name, commenter?.lastname)} comentó la tarea ${task.title} en ${project.name}.`,
        relatedType: "task",
        relatedId: task.id_task,
    })
}

export const ensureOverdueTaskNotificationsForUser = async (userId: string) => {
    const tasks = await getTasksByAssignedUser(userId)
    const now = new Date()

    for (const task of tasks) {
        if (!task.end_date || task.status === "completed" || task.end_date.getTime() >= now.getTime()) {
            continue
        }

        const dedupeKey = `task-overdue:${task.id_task}:${task.end_date.toISOString().slice(0, 10)}`
        const alreadySent = await hasNotificationDedupeKey(dedupeKey)
        if (alreadySent) {
            continue
        }

        const project = await getProjectById(task.id_project)
        await createNotification({
            recipientUserId: userId,
            actorUserId: null,
            category: NotificationCategory.TASK_OVERDUE,
            title: "Tarea vencida",
            message: project
                ? `La tarea ${task.title} del proyecto ${project.name} venció el ${task.end_date.toLocaleDateString("es-ES")}.`
                : `La tarea ${task.title} venció el ${task.end_date.toLocaleDateString("es-ES")}.`,
            relatedType: "task",
            relatedId: task.id_task,
            dedupeKey,
        })
    }
}

// Genera avisos de tareas próximas a vencer (dentro de DUE_SOON_DAYS, aún no
// vencidas ni completadas) para el usuario asignado. On-demand en cada feed,
// con dedupe por tarea+fecha para no repetir.
export const ensureDueSoonTaskNotificationsForUser = async (userId: string) => {
    const tasks = await getTasksByAssignedUser(userId)
    const now = new Date()
    const threshold = new Date(now.getTime() + DUE_SOON_DAYS * 24 * 60 * 60 * 1000)

    for (const task of tasks) {
        if (!task.end_date || task.status === "completed") {
            continue
        }

        const due = task.end_date.getTime()
        // Solo las que vencen en el futuro cercano (no vencidas: eso lo cubre overdue).
        if (due < now.getTime() || due > threshold.getTime()) {
            continue
        }

        const dedupeKey = `task-due-soon:${task.id_task}:${task.end_date.toISOString().slice(0, 10)}`
        const alreadySent = await hasNotificationDedupeKey(dedupeKey)
        if (alreadySent) {
            continue
        }

        const project = await getProjectById(task.id_project)
        await createNotification({
            recipientUserId: userId,
            actorUserId: null,
            category: NotificationCategory.TASK_DUE_SOON,
            title: "Tarea por vencer",
            message: project
                ? `La tarea ${task.title} del proyecto ${project.name} vence el ${task.end_date.toLocaleDateString("es-ES")}.`
                : `La tarea ${task.title} vence el ${task.end_date.toLocaleDateString("es-ES")}.`,
            relatedType: "task",
            relatedId: task.id_task,
            dedupeKey,
        })
    }
}

export const notifyAdminUserChange = async (params: {
    actorUserId: string
    category: NotificationCategory.ADMIN_USER_CREATED | NotificationCategory.ADMIN_USER_UPDATED | NotificationCategory.ADMIN_USER_DELETED
    title: string
    actionVerb: string
    targetName: string
}) => {
    const actor = await findUserById(params.actorUserId)
    await notifyAdmins({
        actorUserId: params.actorUserId,
        category: params.category,
        title: params.title,
        message: `${fullName(actor?.name, actor?.lastname)} ${params.actionVerb} ${params.targetName}.`,
        relatedType: "user",
    })
}

export const notifyProfileChangeRequested = async (
    requestId: string,
    actorUserId: string,
    proposedChanges: ProfileChangeFields
) => {
    const actor = await findUserById(actorUserId)
    const who = fullName(actor?.name, actor?.lastname)
    const detail = describeProfileChanges(proposedChanges, actor)
    await notifyAdmins({
        actorUserId,
        category: NotificationCategory.PROFILE_CHANGE_REQUESTED,
        title: "Nueva solicitud de modificación de perfil",
        message: detail
            ? `${who} solicitó cambiar — ${detail}.`
            : `${who} solicitó modificar su perfil.`,
        relatedType: "profile_change_request",
        relatedId: requestId,
    })
}

export const notifyProfileChangeApproved = async (requestId: string, recipientUserId: string, reviewerUserId: string) => {
    const reviewer = await findUserById(reviewerUserId)
    await createNotification({
        recipientUserId,
        actorUserId: reviewerUserId,
        category: NotificationCategory.PROFILE_CHANGE_APPROVED,
        title: "Tu solicitud de modificación fue aprobada",
        message: `${fullName(reviewer?.name, reviewer?.lastname)} aprobó tu solicitud de modificación de perfil.`,
        relatedType: "profile_change_request",
        relatedId: requestId,
    })
}

export const notifyProfileChangeRejected = async (requestId: string, recipientUserId: string, reviewerUserId: string, note: string | null) => {
    const reviewer = await findUserById(reviewerUserId)
    const reason = note && note.trim().length > 0 ? ` Motivo: ${note.trim()}` : ""
    await createNotification({
        recipientUserId,
        actorUserId: reviewerUserId,
        category: NotificationCategory.PROFILE_CHANGE_REJECTED,
        title: "Tu solicitud de modificación fue rechazada",
        message: `${fullName(reviewer?.name, reviewer?.lastname)} rechazó tu solicitud de modificación de perfil.${reason}`,
        relatedType: "profile_change_request",
        relatedId: requestId,
    })
}

export const notifyProfileChangeCancelled = async (requestId: string, actorUserId: string) => {
    const actor = await findUserById(actorUserId)
    await notifyAdmins({
        actorUserId,
        category: NotificationCategory.PROFILE_CHANGE_CANCELLED,
        title: "Solicitud de modificación cancelada",
        message: `${fullName(actor?.name, actor?.lastname)} canceló su solicitud de modificación de perfil.`,
        relatedType: "profile_change_request",
        relatedId: requestId,
    })
}

export const getNotificationFeed = async (userId: string, limit = 20) => {
    await ensureOverdueTaskNotificationsForUser(userId)
    await ensureDueSoonTaskNotificationsForUser(userId)

    const [notifications, unreadCount] = await Promise.all([
        getNotificationsForUser(userId, limit),
        countUnreadNotifications(userId),
    ])

    return { notifications, unreadCount }
}

export const readAllNotifications = async (userId: string) => {
    return await markAllNotificationsAsRead(userId)
}