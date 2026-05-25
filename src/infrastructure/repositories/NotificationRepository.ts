import { In, IsNull } from "typeorm"
import { AppDataSource } from "../db/DataSource"
import { NotificationEntity } from "../db/entities/NotificationEntity"
import { Notification, NotificationCategory } from "../../entities/Notification"

const repo = AppDataSource.getRepository(NotificationEntity)

export type NotificationInput = {
    recipientUserId: string
    actorUserId?: string | null
    category: NotificationCategory
    title: string
    message: string
    relatedType?: string | null
    relatedId?: string | null
    dedupeKey?: string | null
}

export const createNotification = async (data: NotificationInput): Promise<Notification | null> => {
    if (data.dedupeKey) {
        const existing = await repo.findOne({ where: { dedupeKey: data.dedupeKey } })
        if (existing) {
            return existing
        }
    }

    const notification = repo.create({
        ...data,
        actorUserId: data.actorUserId ?? null,
        relatedType: data.relatedType ?? null,
        relatedId: data.relatedId ?? null,
        dedupeKey: data.dedupeKey ?? null,
        readAt: null,
    })

    return await repo.save(notification)
}

export const createNotifications = async (items: NotificationInput[]): Promise<void> => {
    for (const item of items) {
        await createNotification(item)
    }
}

export const getNotificationsForUser = async (userId: string, limit = 20): Promise<Notification[]> => {
    return await repo.find({
        where: { recipientUserId: userId },
        order: { createdAt: "DESC" },
        take: limit,
    })
}

export const countUnreadNotifications = async (userId: string): Promise<number> => {
    return await repo.count({
        where: { recipientUserId: userId, readAt: IsNull() },
    })
}

export const markAllNotificationsAsRead = async (userId: string): Promise<number> => {
    const result = await repo
        .createQueryBuilder()
        .update(NotificationEntity)
        .set({ readAt: () => "GETDATE()" })
        .where("recipientUserId = :userId", { userId })
        .andWhere("readAt IS NULL")
        .execute()

    return result.affected ?? 0
}

export const hasNotificationDedupeKey = async (dedupeKey: string): Promise<boolean> => {
    const found = await repo.findOne({ where: { dedupeKey } })
    return Boolean(found)
}