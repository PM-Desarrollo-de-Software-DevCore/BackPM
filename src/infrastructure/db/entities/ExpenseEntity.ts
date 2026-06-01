import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm"
import { ProjectEntity } from "./ProjectEntity"
import { ExpenseCategory } from "../../../entities/Expense"

@Entity("expense")
export class ExpenseEntity {
    @PrimaryGeneratedColumn("uuid")
    id_expense: string

    // Foreign Key: proyecto (al borrar el proyecto se borran sus gastos)
    @ManyToOne(() => ProjectEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "id_project" })
    project: ProjectEntity

    @Column("uuid")
    id_project: string

    @Column({ type: "float" })
    amount: number

    // Categoria validada a nivel app (varchar sin CHECK, como el rol de member_project).
    @Column({ type: "varchar", length: 30 })
    category: ExpenseCategory

    @Column({ type: "varchar", length: "MAX", nullable: true })
    description: string | null

    @Column({ type: "datetime2" })
    date: Date

    @Column("uuid")
    createdBy: string

    @CreateDateColumn()
    createdAt: Date
}
