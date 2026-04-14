import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, ForeignKey } from "typeorm"
import { UserEntity } from "./UserEntity"

@Entity("projects")
export class ProjectEntity {
    @PrimaryGeneratedColumn("uuid")
    id_proyecto: string

    @Column()
    nombre: string

    @Column({ type: "text", nullable: true })
    descripcion: string

    @Column({ type: "datetime2" })
    fecha_inicio: Date

    @Column({ type: "datetime2", nullable: true })
    fecha_fin: Date | null

    @Column({ default: "activo" })
    estado: string

    // Foreign Key: creado_por (referencia a Usuario)
    @ManyToOne(() => UserEntity, (user) => user.projectsCreated)
    @JoinColumn({ name: "createdBy" })
    createdBy: UserEntity

    @Column("uuid")
    creado_por: string

    @CreateDateColumn()
    createdAt: Date

    // Relaciones inversas
    @OneToMany(() => MemberProjectEntity, (member) => member.project)
    members: MemberProjectEntity[]

    @OneToMany(() => TaskEntity, (task) => task.project)
    tasks: TaskEntity[]

    @OneToMany(() => SprintEntity, (sprint) => sprint.project)
    sprints: SprintEntity[]
}