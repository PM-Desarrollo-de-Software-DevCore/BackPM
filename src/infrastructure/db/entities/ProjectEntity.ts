import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, ForeignKey, JoinColumn } from "typeorm"
import { UserEntity } from "./UserEntity"
import { SprintEntity } from "./SprintEntity"
import { MemberProjectEntity } from "./MemberProjectEntity"
import { TaskEntity } from "./TaskEntity"

@Entity("projects")
export class ProjectEntity {
    @PrimaryGeneratedColumn("uuid")
    id_proyecto: string

    @Column()
    name: string

    @Column({ type: "text", nullable: true })
    description: string

    @Column({ type: "datetime2" })
    start_date: Date

    @Column({ type: "datetime2", nullable: true })
    end_date: Date | null

    @Column({ default: "active" })
    status: string

    @CreateDateColumn()
    createdAt: Date

    // Foreign Key: creado_por (referencia a Usuario)
    @ManyToOne(() => UserEntity, (user) => user.projectsCreated)
    @JoinColumn({ name: "createdBy" })
    createdBy_id: UserEntity

    @Column("uuid")
    createdBy: string

    // Relaciones inversas
    @OneToMany(() => MemberProjectEntity, (member) => member.project)
    members: MemberProjectEntity[]

    @OneToMany(() => TaskEntity, (task) => task.project)
    tasks: TaskEntity[]

    @OneToMany(() => SprintEntity, (sprint) => sprint.project)
    sprints: SprintEntity[]
}