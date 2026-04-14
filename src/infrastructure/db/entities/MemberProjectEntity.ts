
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn , OneToMany } from "typeorm"
import { UserRole } from "../../../entities/User"

@Entity("memberProject")
export class UserEntity {
    @PrimaryGeneratedColumn("uuid")
    id_memberproject: string

    @Column()
    id_user: string

    @Column()
    id_project: string
    
    @Column()
    role: string


    
}

