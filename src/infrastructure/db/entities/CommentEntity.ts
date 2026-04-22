import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm"
import { UserEntity } from "./UserEntity"
import { TaskEntity } from "./TaskEntity"

@Entity("comment")
export class CommentEntity {
    @PrimaryGeneratedColumn("uuid")
    id_comment: string

    @Column({ type: "text" })
    comment: string

    // Foreign Key: id_usuario
    @ManyToOne(() => UserEntity, (user) => user.comments)
    @JoinColumn({ name: "id_user" })
    user: UserEntity

    @Column("uuid")
    id_user: string

    // Foreign Key: id_tarea
    @ManyToOne(() => TaskEntity, (task) => task.comments, { onDelete: "CASCADE" })
    @JoinColumn({ name: "id_task" })
    task: TaskEntity

    @Column("uuid")
    id_task: string

    @CreateDateColumn()
    createdAt: Date
}