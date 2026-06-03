import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn, CreateDateColumn, Unique } from "typeorm"
import { UserEntity } from "./UserEntity"

@Entity("user_technologies")
@Unique("UQ_user_technology", ["id_user", "technology"])
export class UserTechnologyEntity {
    @PrimaryGeneratedColumn("uuid")
    id_user_tech: string

    @ManyToOne(() => UserEntity, (user) => user.technologies, { onDelete: "CASCADE" })
    @JoinColumn({ name: "id_user" })
    user: UserEntity

    @Index("IX_user_technologies_id_user")
    @Column("uuid")
    id_user: string

    @Column({ type: "nvarchar", length: 100 })
    technology: string

    @Column({ type: "int" })
    yearsOfExperience: number

    @CreateDateColumn()
    createdAt: Date
}
