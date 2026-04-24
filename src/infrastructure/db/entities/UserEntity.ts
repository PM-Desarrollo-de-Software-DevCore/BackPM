import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn , OneToMany } from "typeorm"
import { GlobalRole } from "../../../entities/User"
import { ProjectEntity } from "./ProjectEntity"
import { MemberProjectEntity } from "./MemberProjectEntity"
import { TaskEntity } from "./TaskEntity"
import { CommentEntity } from "./CommentEntity"

@Entity("users")
export class UserEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({ type: "varchar", unique: true })
    email: string

    @Column()
    password: string

    @Column()
    name: string

    @Column()
    lastname: string

    @Column({ type: "varchar", enum: GlobalRole, default: GlobalRole.USER })
    globalRole: GlobalRole

    @CreateDateColumn()
    createdAt: Date

    @Column({ type: "varchar", length: 255, nullable: true })
    resetToken: string | null

    @Column({ type: "datetime2", nullable: true })
    resetTokenExpiry: Date | null

    @Column({ type: "varchar", length: 100, nullable: true })
    skill: string | null

    @Column({ type: "varchar", length: 100, nullable: true })
    area: string | null

    @Column({ type: "varchar", length: 20, nullable: true })
    phoneNumber: string | null

     // Relaciones
    @OneToMany(() => ProjectEntity, (project) => project.createdBy)
    projectsCreated: ProjectEntity[]

    @OneToMany(() => MemberProjectEntity, (member) => member.user)
    memberProjects: MemberProjectEntity[]

    @OneToMany(() => TaskEntity, (task) => task.createdBy)
    tasksCreated: TaskEntity[]

    @OneToMany(() => TaskEntity, (task) => task.assignedTo)
    tasksAssigned: TaskEntity[]

    @OneToMany(() => CommentEntity, (comment) => comment.user)
    comments: CommentEntity[]
}

