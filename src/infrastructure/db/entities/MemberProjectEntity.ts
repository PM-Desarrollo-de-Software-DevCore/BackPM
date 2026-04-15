import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { UserEntity } from "./UserEntity"
import { ProjectEntity } from "./ProjectEntity"

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

    @Column({ type: "varchar", length: 50 })
    role: string
}