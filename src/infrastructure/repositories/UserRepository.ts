import { AppDataSource } from "../db/DataSource"
import { UserEntity } from "../db/entities/UserEntity"
import { User } from "../../entities/User"
import { TaskStatus } from "../../entities/Task"

// Hacer un select de la tabla user
const repo = AppDataSource.getRepository(UserEntity)

// Hacer una consulta 
export const findUserByEmail = async (email: string): Promise<User | null> => {
    // password es select:false: lo agregamos explicito para que el login pueda compararlo
    return await repo.createQueryBuilder("u")
        .where("u.email = :email", { email })
        .addSelect("u.password")
        .getOne()
}

export const findUserById = async (id: string): Promise<User | null> => {
    return await repo.findOne({ where: { id } })
}

export const saveUser = async (data: Omit<User, "id" | "createdAt">): Promise<User> => {
    const user = repo.create(data)
    return await repo.save(user)
}

export const findAllUsers = async (): Promise<User[]> => {
    return await repo.find()
}

// Proyeccion SQL del listado de usuarios (GET /users): solo se traen las columnas
// necesarias. password/resetToken/resetTokenExpiry nunca salen (select:false en la entidad).
const USER_DIRECTORY_COLUMNS = [
    "u.id",
    "u.email",
    "u.name",
    "u.lastname",
    "u.globalRole",
    "u.createdAt",
    "u.skill",
    "u.area",
    "u.profileImageUrl",
    "u.specialty",
]
// PII que solo ven los admins.
const USER_PRIVATE_COLUMNS = ["u.phoneNumber", "u.cvUrl"]

export interface FindUsersPageOptions {
    skip?: number | undefined
    take?: number | undefined
    includePrivate?: boolean | undefined
}

export interface UsersPage {
    items: User[]
    total: number
}

// Listado con proyeccion SQL y paginacion opcional: si se pasan skip/take se aplica
// OFFSET/FETCH en la BD (en vez de cargar toda la tabla y recortar en memoria).
export const findUsersPage = async (
    { skip, take, includePrivate = false }: FindUsersPageOptions = {}
): Promise<UsersPage> => {
    const columns = includePrivate
        ? [...USER_DIRECTORY_COLUMNS, ...USER_PRIVATE_COLUMNS]
        : USER_DIRECTORY_COLUMNS
    const qb = repo
        .createQueryBuilder("u")
        .select(columns)
        // Orden estable: requerido para que OFFSET/FETCH sea deterministico en SQL Server.
        .orderBy("u.createdAt", "DESC")
        .addOrderBy("u.id", "ASC")
    if (typeof skip === "number") qb.skip(skip)
    if (typeof take === "number") qb.take(take)
    const [items, total] = await qb.getManyAndCount()
    return { items, total }
}

export const updateUser = async (id: string, data: Partial<User>): Promise<void> => {
    await repo.update(id, data as any)
}

export const deleteUser = async (id: string): Promise<void> => {
    await repo.delete(id)
}

export const findUserByResetToken = async (token: string): Promise<User | null> => {
    // resetToken/expiry son select:false: se agregan para validar el flujo de reseteo
    return await repo.createQueryBuilder("u")
        .where("u.resetToken = :token", { token })
        .addSelect(["u.resetToken", "u.resetTokenExpiry"])
        .getOne()
}

export const updateResetToken = async (userId: string, token: string, expiry: Date): Promise<void> => {
    await repo.update(userId, {
        resetToken: token,
        resetTokenExpiry: expiry
    })
}

export const clearResetToken = async (userId: string): Promise<void> => {
    await repo.update(userId, {
        resetToken: null,
        resetTokenExpiry: null
    })
}

// El leaderboard se calcula dinamicamente desde las tareas: los "puntos" de un
// usuario son la suma de story_points de sus tareas COMPLETADAS (null = 0 puntos).
export interface LeaderboardRow {
    id: string
    name: string
    lastname: string
    profileImageUrl: string | null
    points: number
}

const SUM_COMPLETED_POINTS = `COALESCE(SUM(t."story_points"), 0)`

const mapLeaderboardRows = (rows: any[]): LeaderboardRow[] =>
    rows.map((r) => ({
        id: r.id,
        name: r.name,
        lastname: r.lastname,
        profileImageUrl: r.profileImageUrl ?? null,
        points: Number(r.points) || 0
    }))

export const getLeaderboard = async (limit: number): Promise<LeaderboardRow[]> => {
    const rows = await repo
        .createQueryBuilder("u")
        .where("u.globalRole <> :adminRole", {
            adminRole: "admin"
        })
        .leftJoin("task", "t", `t."assignedTo" = u."id" AND t."completedAt" IS NOT NULL`)
        .select("u.id", "id")
        .addSelect("u.name", "name")
        .addSelect("u.lastname", "lastname")
        .addSelect("u.profileImageUrl", "profileImageUrl")
        .addSelect(SUM_COMPLETED_POINTS, "points")
        .groupBy("u.id")
        .addGroupBy("u.name")
        .addGroupBy("u.lastname")
        .addGroupBy("u.profileImageUrl")
        .orderBy(SUM_COMPLETED_POINTS, "DESC")
        .addOrderBy("u.name", "ASC")
        .limit(limit)
        .getRawMany()
    return mapLeaderboardRows(rows)
}

export const getLeaderboardByProject = async (projectId: string, limit: number): Promise<LeaderboardRow[]> => {
    const rows = await repo
        .createQueryBuilder("u")
        .where("u.globalRole <> :adminRole", {
            adminRole: "admin"
        })
        .innerJoin("member_project", "mp", `mp."id_user" = u."id" AND mp."id_project" = :projectId`)
        .leftJoin("task", "t", `t."assignedTo" = u."id" AND t."id_project" = :projectId AND t."completedAt" IS NOT NULL`)
        .select("u.id", "id")
        .addSelect("u.name", "name")
        .addSelect("u.lastname", "lastname")
        .addSelect("u.profileImageUrl", "profileImageUrl")
        .addSelect(SUM_COMPLETED_POINTS, "points")
        .setParameters({ projectId, status: TaskStatus.COMPLETED })
        .groupBy("u.id")
        .addGroupBy("u.name")
        .addGroupBy("u.lastname")
        .addGroupBy("u.profileImageUrl")
        .orderBy(SUM_COMPLETED_POINTS, "DESC")
        .addOrderBy("u.name", "ASC")
        .limit(limit)
        .getRawMany()
    return mapLeaderboardRows(rows)
}
