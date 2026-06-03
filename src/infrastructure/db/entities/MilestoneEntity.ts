import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm"
import { ProjectEntity } from "./ProjectEntity"
import { UserEntity } from "./UserEntity"

@Entity("milestones")
export class MilestoneEntity {
    @PrimaryGeneratedColumn("uuid")
    id_milestone: string

    @Column()
    title: string

    @Column({ type: "varchar", length: "MAX", nullable: true })
    description: string | null

    // Punto del cronograma que marca el hito
    @Column({ type: "datetime2" })
    due_date: Date

    // null = hito no completado
    @Column({ type: "datetime2", nullable: true })
    completedAt: Date | null

    @CreateDateColumn()
    createdAt: Date

    // Foreign Key: id_project
    @ManyToOne(() => ProjectEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "id_project" })
    project: ProjectEntity

    @Index("IX_milestones_id_project")
    @Column("uuid")
    id_project: string

    // Foreign Key: createdBy
    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: "createdBy" })
    createdBy_user: UserEntity

    @Column("uuid")
    createdBy: string
}
