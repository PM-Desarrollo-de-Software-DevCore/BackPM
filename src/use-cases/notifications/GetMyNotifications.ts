import { getNotificationFeed } from "../../infrastructure/services/notificationService"

export const getMyNotificationsUseCase = async (userId: string, limit = 20) => {
    return await getNotificationFeed(userId, limit)
}