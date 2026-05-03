import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from "typeorm"
import { ProjectEntity } from "./ProjectEntity"
import { SprintEntity } from "./SprintEntity"
import { UserEntity } from "./UserEntity"
import { CommentEntity } from "./CommentEntity"
import { TaskPriority } from "../../../entities/Task"
import { TaskStatus } from "../../../entities/Task"

@Entity("task")
export class TaskEntity {
    @PrimaryGeneratedColumn("uuid")
    id_task: string

    @Column()
    title: string

    @Column({ type: "varchar", length: "MAX", nullable: true })
    description: string | null

    @Column({ type: "int" })
    task_number: number

    @Column({ type: "int", default: 0 })
    progress: number

    @Column({ type: 'varchar', enum: TaskStatus, default: TaskStatus.PENDING })
    status: TaskStatus

    @Column({ type: 'varchar', enum: TaskPriority, default: TaskPriority.MEDIUM })
    priority: TaskPriority

    @Column({ type: "datetime2" })
    start_date: Date

    @Column({ type: "datetime2", nullable: true })
    end_date: Date | null

    @CreateDateColumn()
    createdAt: Date

    // Foreign Key: id_proyecto
    @ManyToOne(() => ProjectEntity, (project) => project.tasks, { onDelete: "CASCADE" })
    @JoinColumn({ name: "id_project" })
    project: ProjectEntity

    @Column("uuid")
    id_project: string

    // Foreign Key: id_sprint (opcional)
    @ManyToOne(() => SprintEntity, (sprint) => sprint.tasks, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "id_sprint" })
    sprint: SprintEntity | null

    @Column("uuid", { nullable: true })
    id_sprint: string | null

    // Foreign Key: creado_por
    @ManyToOne(() => UserEntity, (user) => user.tasksCreated)
    @JoinColumn({ name: "createdBy" })
    createdBy_id: UserEntity

    @Column("uuid")
    createdBy: string

    // Foreign Key: asignado_a
    @ManyToOne(() => UserEntity, (user) => user.tasksAssigned, { nullable: true })
    @JoinColumn({ name: "assignedTo" })
    assignedTo_id: UserEntity | null

    @Column("uuid", { nullable: true })
    assignedTo: string | null

    // Relación inversa
    @OneToMany(() => CommentEntity, (comment) => comment.task)
    comments: CommentEntity[]
}