export enum GlobalRole {
    ADMIN =  "admin",
    USER = "user"
}

export enum Specialty {
    FRONTEND = "frontend",
    BACKEND = "backend",
    DATABASE = "database",
    FULLSTACK = "fullstack",
    DEVOPS = "devops",
    MOBILE = "mobile",
    QA = "qa"
}

export interface User {
    id: string,
    email: string,
    password: string,
    name: string,
    lastname: string,
    globalRole: GlobalRole,
    createdAt: Date
    resetToken?: string | null,
    resetTokenExpiry?: Date | null,
    skill?: string | null,
    area?: string | null,
    phoneNumber?: string | null,
    profileImageUrl?: string | null,
    cvUrl?: string | null,
    specialty?: Specialty | null
}
