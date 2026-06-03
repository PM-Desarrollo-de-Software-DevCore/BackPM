import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm"
import { NotificationCategory } from "../../../entities/Notification"

@Entity("notifications")
// Indices ya existentes en la BD (migracion 1780). Declarados aqui para que el
// esquema declarado coincida y migration:generate no los dropee.
@Index("IDX_notifications_recipient_created", ["recipientUserId", "createdAt"])
@Index("IDX_notifications_recipient_read", ["recipientUserId", "readAt"])
@Index("IDX_notifications_dedupeKey", ["dedupeKey"])
export class NotificationEntity {
    @PrimaryGeneratedColumn("uuid")
    id_notification: string

    @Column("uuid")
    recipientUserId: string

    @Column({ type: "uuid", nullable: true })
    actorUserId: string | null

    @Column({ type: "varchar", length: 60, enum: NotificationCategory })
    category: NotificationCategory

    @Column({ type: "varchar", length: 160 })
    title: string

    @Column({ type: "varchar", length: "MAX" })
    message: string

    @Column({ type: "varchar", length: 40, nullable: true })
    relatedType: string | null

    @Column({ type: "uuid", nullable: true })
    relatedId: string | null

    @Column({ type: "varchar", length: 200, nullable: true })
    dedupeKey: string | null

    @Column({ type: "datetime2", nullable: true })
    readAt: Date | null

    @CreateDateColumn()
    createdAt: Date
}