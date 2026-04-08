import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"
import { UserRole } from "../../../entities/User"

@Entity("users")
export class UserEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({ unique: true })
    email: string

    @Column()
    password: string

    @Column()
    name: string

    @Column()
    lastname: string

    @Column({ type: "varchar", length: 50, default: UserRole.DEVELOPER })
    role: UserRole

    @CreateDateColumn()
    createdAt: Date
}

