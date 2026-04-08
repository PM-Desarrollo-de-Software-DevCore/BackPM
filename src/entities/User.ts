import { NumericType } from "typeorm"

export enum UserRole {
    ADMIN =  "admin",
    DEVELOPER = "developer",
    SCRUM_MASTER = "scrum_master"
}

export interface User {
    id: string,
    email: string,
    password: string,
    name: string,
    lastname: string,
    role: UserRole,
    createdAt: Date
}
