import { readAllNotifications } from "../../infrastructure/services/notificationService"

export const markMyNotificationsAsReadUseCase = async (userId: string) => {
    return await readAllNotifications(userId)
}