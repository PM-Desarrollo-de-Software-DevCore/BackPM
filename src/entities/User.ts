export enum GlobalRole {
    ADMIN =  "admin",
    USER = "user"
}

// Email reservado del perfil "ghost" del sistema: marcador único que absorbe el
// historial de los usuarios eliminados. No se puede iniciar sesión, eliminar ni
// modificar, y se excluye de los listados de usuarios.
export const GHOST_USER_EMAIL = "cuenta-eliminada@frontpm.system"

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
