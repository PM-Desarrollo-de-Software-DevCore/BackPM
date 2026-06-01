import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm"
import { UserEntity } from "./UserEntity"
import { TaskEntity } from "./TaskEntity"

@Entity("time_entry")
export class TimeEntryEntity {
    @PrimaryGeneratedColumn("uuid")
    id_time_entry: string

    // Foreign Key: tarea (al borrar la tarea se borran sus registros de tiempo)
    @ManyToOne(() => TaskEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "id_task" })
    task: TaskEntity

    @Column("uuid")
    id_task: string

    // Foreign Key: usuario que registro las horas
    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: "id_user" })
    user: UserEntity

    @Column("uuid")
    id_user: string

    // Desnormalizado desde la tarea para agregaciones por proyecto (EVM, totales).
    @Column("uuid")
    id_project: string

    @Column({ type: "float" })
    hours: number

    @Column({ type: "datetime2" })
    work_date: Date

    @Column({ type: "varchar", length: "MAX", nullable: true })
    description: string | null

    @CreateDateColumn()
    createdAt: Date
}
