import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm"
import { UserEntity } from "./UserEntity"
import { SprintEntity } from "./SprintEntity"
import { MemberProjectEntity } from "./MemberProjectEntity"
import { TaskEntity } from "./TaskEntity"
import { ProjectStatus, ProjectPriority, ProjectMethodology, ProjectBillingModel } from "../../../entities/Project"

@Entity("projects")
export class ProjectEntity {
    @PrimaryGeneratedColumn("uuid")
    id_project: string

    @Column()
    name: string

    @Column({ type: "varchar", length: "MAX", nullable: true })
    description: string | null

    @Column({ type: "nvarchar", length: 255 })
    client: string

    @Column({ type: "nvarchar", length: 255 })
    project_type: string

    @Column({ type: "nvarchar", length: "MAX", nullable: true })
    project_objective: string | null

    @Column({ type: "varchar", length: 20, enum: ProjectMethodology })
    methodology: ProjectMethodology

    @Column({ type: "int", nullable: true })
    estimated_sprints: number | null

    @Column({ type: "float", nullable: true })
    budget: number | null

    @Column({ type: "float", nullable: true })
    monthly_cost: number | null

    @Column({ type: "varchar", length: 30, enum: ProjectBillingModel, nullable: true })
    billing_model: ProjectBillingModel | null

    @Column({ type: "datetime2" })
    start_date: Date

    @Column({ type: "datetime2", nullable: true })
    end_date: Date | null

    @Column({ type: "varchar", length: 20, enum: ProjectPriority, default: ProjectPriority.MEDIUM })
    priority: ProjectPriority

    @Column({ type: "varchar", enum: ProjectStatus, default: ProjectStatus.PLANNING })
    status: ProjectStatus

    @CreateDateColumn()
    createdAt: Date

    @ManyToOne(() => UserEntity, (user) => user.projectsCreated)
    @JoinColumn({ name: "createdBy" })
    createdBy_id: UserEntity

    @Column("uuid")
    createdBy: string

    @OneToMany(() => MemberProjectEntity, (member) => member.project)
    members: MemberProjectEntity[]

    @OneToMany(() => TaskEntity, (task) => task.project)
    tasks: TaskEntity[]

    @OneToMany(() => SprintEntity, (sprint) => sprint.project)
    sprints: SprintEntity[]
}