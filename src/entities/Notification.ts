export enum NotificationCategory {
    PROJECT_CREATED = "project_created",
    PROJECT_COMPLETED = "project_completed",
    PROJECT_MEMBER_ADDED = "project_member_added",
    TASK_ASSIGNED = "task_assigned",
    TASK_COMMENTED = "task_commented",
    TASK_OVERDUE = "task_overdue",
    ADMIN_USER_CREATED = "admin_user_created",
    ADMIN_USER_UPDATED = "admin_user_updated",
    ADMIN_USER_DELETED = "admin_user_deleted",
    PROFILE_CHANGE_REQUESTED = "profile_change_requested",
    PROFILE_CHANGE_APPROVED = "profile_change_approved",
    PROFILE_CHANGE_REJECTED = "profile_change_rejected",
    PROFILE_CHANGE_CANCELLED = "profile_change_cancelled"
}

export interface Notification {
    id_notification: string
    recipientUserId: string
    actorUserId: string | null
    category: NotificationCategory
    title: string
    message: string
    relatedType: string | null
    relatedId: string | null
    dedupeKey: string | null
    readAt: Date | null
    createdAt: Date
}