import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from "typeorm"
import { ProjectEntity } from "./ProjectEntity"
import { TaskEntity } from "./TaskEntity"

@Entity("sprints")
export class SprintEntity {
    @PrimaryGeneratedColumn("uuid")
    id_sprint: string

    @Column()
    name: string

    @Column({ type: "datetime2" })
    start_date: Date

    @Column({ type: "datetime2" })
    end_date: Date

    @Column({ default: "planned" })
    status: string

    @CreateDateColumn()
    createdAt: Date

    // Foreign Key: id_proyecto
    @ManyToOne(() => ProjectEntity, (project) => project.sprints, { onDelete: "NO ACTION" })
    @JoinColumn({ name: "id_project" })
    project: ProjectEntity

    @Column("uuid")
    id_project: string


    // Relación inversa
    @OneToMany(() => TaskEntity, (task) => task.sprint)
    tasks: TaskEntity[]
}