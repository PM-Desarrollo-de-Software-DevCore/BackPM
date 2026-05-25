import { NotificationCategory } from "../../entities/Notification"
import { createNotification, createNotifications, countUnreadNotifications, getNotificationsForUser, hasNotificationDedupeKey, markAllNotificationsAsRead } from "../repositories/NotificationRepository"
import { findAllUsers, findUserById } from "../repositories/UserRepository"
import { getProjectById } from "../repositories/ProjectRepository"
import { getTaskById, getTasksByAssignedUser } from "../repositories/TaskRepository"

const fullName = (name?: string | null, lastname?: string | null) => [name, lastname].filter(Boolean).join(" ") || "Usuario"

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

    await notifyAdmins({
        actorUserId,
        category: NotificationCategory.PROJECT_COMPLETED,
        title: "Proyecto finalizado",
        message: `${fullName(actor?.name, actor?.lastname)} marcó como finalizado el proyecto ${project.name}.`,
        relatedType: "project",
        relatedId: project.id_project,
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

export const getNotificationFeed = async (userId: string, limit = 20) => {
    await ensureOverdueTaskNotificationsForUser(userId)

    const [notifications, unreadCount] = await Promise.all([
        getNotificationsForUser(userId, limit),
        countUnreadNotifications(userId),
    ])

    return { notifications, unreadCount }
}

export const readAllNotifications = async (userId: string) => {
    return await markAllNotificationsAsRead(userId)
}