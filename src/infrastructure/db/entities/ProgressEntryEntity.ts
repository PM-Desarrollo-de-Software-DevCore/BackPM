import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm"
import { ProjectEntity } from "./ProjectEntity"
import { SprintEntity } from "./SprintEntity"
import { UserEntity } from "./UserEntity"
import { ProgressEntryType } from "../../../entities/ProgressEntry"

@Entity("progress_entries")
export class ProgressEntryEntity {
    @PrimaryGeneratedColumn("uuid")
    id_entry: string

    // avance | bloqueador
    @Column({ type: "varchar", enum: ProgressEntryType })
    type: ProgressEntryType

    @Column({ type: "varchar", length: "MAX" })
    description: string

    // Fecha del registro (la captura el usuario; default = ahora)
    @Column({ type: "datetime2" })
    date: Date

    @CreateDateColumn()
    createdAt: Date

    // Foreign Key: id_project (obligatorio)
    @ManyToOne(() => ProjectEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "id_project" })
    project: ProjectEntity

    @Column("uuid")
    id_project: string

    // Foreign Key: id_sprint (opcional)
    @ManyToOne(() => SprintEntity, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "id_sprint" })
    sprint: SprintEntity | null

    @Column("uuid", { nullable: true })
    id_sprint: string | null

    // Foreign Key: createdBy
    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: "createdBy" })
    createdBy_user: UserEntity

    @Column("uuid")
    createdBy: string
}
