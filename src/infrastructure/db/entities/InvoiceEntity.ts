import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm"
import { ProjectEntity } from "./ProjectEntity"
import { InvoiceStatus } from "../../../entities/Invoice"

@Entity("invoice")
export class InvoiceEntity {
    @PrimaryGeneratedColumn("uuid")
    id_invoice: string

    // Foreign Key: proyecto (al borrar el proyecto se borran sus facturas)
    @ManyToOne(() => ProjectEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "id_project" })
    project: ProjectEntity

    @Column("uuid")
    id_project: string

    @Column({ type: "float" })
    amount: number

    // Estado validado a nivel app (varchar sin CHECK).
    @Column({ type: "varchar", length: 20, default: InvoiceStatus.DRAFT })
    status: InvoiceStatus

    @Column({ type: "varchar", length: "MAX", nullable: true })
    concept: string | null

    @Column({ type: "datetime2" })
    issue_date: Date

    @Column({ type: "datetime2", nullable: true })
    due_date: Date | null

    @Column({ type: "datetime2", nullable: true })
    period_start: Date | null

    @Column({ type: "datetime2", nullable: true })
    period_end: Date | null

    // Referencia informativa a un hito (fixed_price); sin FK para no acoplar el borrado de hitos.
    @Column({ type: "uuid", nullable: true })
    id_milestone: string | null

    @Column("uuid")
    createdBy: string

    @CreateDateColumn()
    createdAt: Date
}
