import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm"
import { UserEntity } from "./UserEntity"
import { ProfileChangeRequestStatus } from "../../../entities/ProfileChangeRequest"

@Entity("profile_change_requests")
export class ProfileChangeRequestEntity {
    @PrimaryGeneratedColumn("uuid")
    id_request: string

    // Foreign Key: usuario solicitante
    @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "id_user" })
    user: UserEntity

    @Index("IX_pcr_id_user")
    @Column("uuid")
    id_user: string

    // JSON serializado con los campos a cambiar (whitelist en use-case)
    @Column({ type: "varchar", length: "MAX" })
    proposedChanges: string

    @Column({ type: "varchar", length: 20, enum: ProfileChangeRequestStatus, default: ProfileChangeRequestStatus.PENDING })
    status: ProfileChangeRequestStatus

    // Foreign Key: admin que aprobo/rechazo (null mientras pending o cancelled).
    // ON DELETE NO ACTION para evitar "multiple cascade paths" en SQL Server
    // (ya hay otro FK a users con CASCADE en id_user).
    @ManyToOne(() => UserEntity, { nullable: true, onDelete: "NO ACTION" })
    @JoinColumn({ name: "reviewedBy" })
    reviewer: UserEntity | null

    @Column({ type: "uniqueidentifier", nullable: true })
    reviewedBy: string | null

    @Column({ type: "varchar", length: "MAX", nullable: true })
    reviewNote: string | null

    @CreateDateColumn()
    createdAt: Date

    @Column({ type: "datetime2", nullable: true })
    reviewedAt: Date | null
}
