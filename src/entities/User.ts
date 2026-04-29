export enum GlobalRole {
    ADMIN =  "admin",
    USER = "user"
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
    phoneNumber?: string | null
}
