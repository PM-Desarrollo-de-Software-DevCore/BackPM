import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from "typeorm"
import { ProjectEntity } from "./ProjectEntity"
import { SprintEntity } from "./SprintEntity"
import { UserEntity } from "./UserEntity"

@Entity("tareas")
export class TaskEntity {
    @PrimaryGeneratedColumn("uuid")
    id_tarea: string

    @Column()
    titulo: string

    @Column({ type: "text", nullable: true })
    descripcion: string

    @Column()
    prioridad: string

    @Column({ default: "pendiente" })
    estado: string

    @Column({ type: "datetime2" })
    fecha_inicio: Date

    @Column({ type: "datetime2", nullable: true })
    fecha_fin: Date | null

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
    createdBy: UserEntity

    @Column("uuid")
    createdBy: string

    // Foreign Key: asignado_a
    @ManyToOne(() => UserEntity, (user) => user.tasksAssigned, { nullable: true })
    @JoinColumn({ name: "assignedTo" })
    assignedTo: UserEntity | null

    @Column("uuid", { nullable: true })
    assignedTo: string | null

    @CreateDateColumn()
    createdAt: Date

    // Relación inversa
    @OneToMany(() => CommentEntity, (comment) => comment.task)
    comments: CommentEntity[]
}