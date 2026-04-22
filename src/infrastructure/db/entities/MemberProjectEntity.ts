import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm"
import { UserEntity } from "./UserEntity"
import { ProjectEntity } from "./ProjectEntity"
import { ProjectRole } from "../../../entities/MemberProject"

@Entity("member_project")
export class MemberProjectEntity {
    @PrimaryGeneratedColumn("uuid")
    id_mp: string

    // Foreign Key: id_usuario
    @ManyToOne(() => UserEntity, (user) => user.memberProjects, { onDelete: "CASCADE" })
    @JoinColumn({ name: "id_user" })
    user: UserEntity

    @Column("uuid")
    id_user: string

    // Foreign Key: id_proyecto
    @ManyToOne(() => ProjectEntity, (project) => project.members, { onDelete: "CASCADE" })
    @JoinColumn({ name: "id_project" })
    project: ProjectEntity

    @Column("uuid")
    id_project: string

    @Column({ type: "varchar", length: 50, default: ProjectRole.DEVELOPER })
    role: ProjectRole

    @CreateDateColumn()
    createdAt: Date
}