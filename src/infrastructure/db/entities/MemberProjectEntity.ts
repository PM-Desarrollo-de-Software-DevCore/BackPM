import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm"
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

    @Index("IX_member_project_id_user")
    @Column("uuid")
    id_user: string

    // Foreign Key: id_proyecto
    @ManyToOne(() => ProjectEntity, (project) => project.members, { onDelete: "CASCADE" })
    @JoinColumn({ name: "id_project" })
    project: ProjectEntity

    @Index("IX_member_project_id_project")
    @Column("uuid")
    id_project: string

    @Column({ type: "varchar", length: 50, default: ProjectRole.DEVELOPER })
    role: ProjectRole

    // Capacidad estimada (full-time equivalent), p.ej. 1 = tiempo completo, 0.5 = medio tiempo.
    @Column({ type: "float", nullable: true })
    fte: number | null

    // Costo mensual del miembro en este proyecto (dato sensible: solo lo ve admin/PM).
    @Column({ type: "float", nullable: true })
    monthly_rate: number | null

    // Tarifa de venta por HORA facturada al cliente (revenue, T&M). Dato sensible: solo admin/PM.
    // Independiente de monthly_rate (costo); juntas permiten margen. NO se usa en EVM (cost-only).
    @Column({ type: "float", nullable: true })
    sale_rate: number | null

    @CreateDateColumn()
    createdAt: Date
}