import "reflect-metadata"
import bcrypt from "bcrypt"
import { AppDataSource } from "../infrastructure/db/DataSource"
import { UserEntity } from "../infrastructure/db/entities/UserEntity"
import { ProjectEntity } from "../infrastructure/db/entities/ProjectEntity"
import { TaskEntity } from "../infrastructure/db/entities/TaskEntity"
import { GlobalRole } from "../entities/User"
import { ProjectStatus, ProjectPriority } from "../entities/Project"
import { TaskStatus, TaskPriority } from "../entities/Task"

const SEED_EMAIL = "scrum.test@devcore.com"
const SEED_PASSWORD = "12345678"
const SEED_USER_NAME = "Scrum"
const SEED_USER_LASTNAME = "Test"
const DUMMY_PROJECT_NAME = "[DUMMY] Weekly Progress"

const COMPLETED_DISTRIBUTION: number[][] = [
    [3, 5, 2, 6, 4, 1, 0],
    [4, 3, 7, 5, 6, 2, 1],
    [2, 4, 3, 5, 3, 1, 2]
]

const PRIORITIES_CYCLE: TaskPriority[] = [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH]

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const startOfWeekMonday = (date: Date): Date => {
    const result = new Date(date)
    result.setHours(0, 0, 0, 0)
    const day = result.getDay()
    const diff = day === 0 ? -6 : 1 - day
    result.setDate(result.getDate() + diff)
    return result
}

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}

const randomBusinessHourDate = (baseDay: Date): Date => {
    const result = new Date(baseDay)
    const hour = 9 + Math.floor(Math.random() * 9)
    const minute = Math.floor(Math.random() * 60)
    const second = Math.floor(Math.random() * 60)
    result.setHours(hour, minute, second, 0)
    return result
}

const findOrCreateUser = async (): Promise<UserEntity> => {
    const userRepo = AppDataSource.getRepository(UserEntity)
    const existing = await userRepo.findOne({ where: { email: SEED_EMAIL } })
    if (existing) {
        console.log(`[seed] Usuario existente reutilizado: ${existing.email} (${existing.id})`)
        return existing
    }
    const hashed = await bcrypt.hash(SEED_PASSWORD, 10)
    const created = userRepo.create({
        email: SEED_EMAIL,
        password: hashed,
        name: SEED_USER_NAME,
        lastname: SEED_USER_LASTNAME,
        globalRole: GlobalRole.USER
    })
    const saved = await userRepo.save(created)
    console.log(`[seed] Usuario creado: ${saved.email} (${saved.id})`)
    return saved
}

const findDummyProject = async (userId: string): Promise<ProjectEntity | null> => {
    const projectRepo = AppDataSource.getRepository(ProjectEntity)
    return await projectRepo.findOne({
        where: { name: DUMMY_PROJECT_NAME, createdBy: userId }
    })
}

const createDummyProject = async (userId: string): Promise<ProjectEntity> => {
    const projectRepo = AppDataSource.getRepository(ProjectEntity)
    const today = new Date()
    const startDate = addDays(today, -30)
    const endDate = addDays(today, 30)
    const created = projectRepo.create({
        name: DUMMY_PROJECT_NAME,
        description: "Proyecto generado por el seed seedWeeklyProgress para alimentar el dashboard con datos dummy.",
        start_date: startDate,
        end_date: endDate,
        priority: ProjectPriority.MEDIUM,
        status: ProjectStatus.IN_PROGRESS,
        createdBy: userId
    })
    const saved = await projectRepo.save(created)
    console.log(`[seed] Proyecto dummy creado: ${saved.name} (${saved.id_project})`)
    return saved
}

const deleteTasksOfProject = async (projectId: string): Promise<number> => {
    const taskRepo = AppDataSource.getRepository(TaskEntity)
    const result = await taskRepo.delete({ id_project: projectId })
    return result.affected ?? 0
}

const buildCompletedTasks = (
    projectId: string,
    userId: string,
    startingNumber: number
): TaskEntity[] => {
    const taskRepo = AppDataSource.getRepository(TaskEntity)
    const today = new Date()
    const currentWeekStart = startOfWeekMonday(today)

    const tasks: TaskEntity[] = []
    let counter = startingNumber

    COMPLETED_DISTRIBUTION.forEach((week, weekIndex) => {
        const weekStart = addDays(currentWeekStart, -7 * weekIndex)
        week.forEach((count, dayIndex) => {
            const dayBase = addDays(weekStart, dayIndex)
            for (let i = 0; i < count; i++) {
                const completedAt = randomBusinessHourDate(dayBase)
                const priority = PRIORITIES_CYCLE[counter % PRIORITIES_CYCLE.length]!
                tasks.push(
                    taskRepo.create({
                        title: `Dummy Task #${counter} - ${DAY_NAMES[dayIndex]}`,
                        description: `Tarea dummy completada el ${DAY_NAMES[dayIndex]} (semana offset ${-weekIndex}).`,
                        task_number: counter,
                        progress: 100,
                        status: TaskStatus.COMPLETED,
                        priority,
                        end_date: null,
                        completedAt,
                        id_project: projectId,
                        id_sprint: null,
                        createdBy: userId,
                        assignedTo: userId
                    })
                )
                counter++
            }
        })
    })

    return tasks
}

const buildMixedTasks = (
    projectId: string,
    userId: string,
    startingNumber: number
): TaskEntity[] => {
    const taskRepo = AppDataSource.getRepository(TaskEntity)
    const today = new Date()
    const tasks: TaskEntity[] = []
    let counter = startingNumber

    for (let i = 0; i < 5; i++) {
        const priority = PRIORITIES_CYCLE[counter % PRIORITIES_CYCLE.length]!
        tasks.push(
            taskRepo.create({
                title: `Dummy In-Progress Task #${counter}`,
                description: "Tarea dummy en progreso para enriquecer el dashboard general.",
                task_number: counter,
                progress: 25 + i * 15,
                status: TaskStatus.IN_PROGRESS,
                priority,
                end_date: addDays(today, 7 + i * 2),
                completedAt: null,
                id_project: projectId,
                id_sprint: null,
                createdBy: userId,
                assignedTo: userId
            })
        )
        counter++
    }

    for (let i = 0; i < 5; i++) {
        const priority = PRIORITIES_CYCLE[counter % PRIORITIES_CYCLE.length]!
        const isOverdue = i < 2
        const endDate = isOverdue ? addDays(today, -3 - i) : addDays(today, 10 + i * 3)
        tasks.push(
            taskRepo.create({
                title: `Dummy Pending Task #${counter}${isOverdue ? " (overdue)" : ""}`,
                description: "Tarea dummy pendiente para enriquecer el dashboard general.",
                task_number: counter,
                progress: 0,
                status: TaskStatus.PENDING,
                priority,
                end_date: endDate,
                completedAt: null,
                id_project: projectId,
                id_sprint: null,
                createdBy: userId,
                assignedTo: userId
            })
        )
        counter++
    }

    return tasks
}

const seed = async (): Promise<void> => {
    const user = await findOrCreateUser()
    let project = await findDummyProject(user.id)
    if (project) {
        const deleted = await deleteTasksOfProject(project.id_project)
        console.log(`[seed] Proyecto dummy reutilizado (${project.id_project}). Tareas previas eliminadas: ${deleted}`)
    } else {
        project = await createDummyProject(user.id)
    }

    const completedTasks = buildCompletedTasks(project.id_project, user.id, 1)
    const mixedTasks = buildMixedTasks(project.id_project, user.id, completedTasks.length + 1)
    const allTasks = [...completedTasks, ...mixedTasks]

    const taskRepo = AppDataSource.getRepository(TaskEntity)
    await taskRepo.save(allTasks, { chunk: 50 })

    console.log(`[seed] Insertadas ${completedTasks.length} tareas completed (3 semanas).`)
    console.log(`[seed] Insertadas ${mixedTasks.length} tareas mixed (5 in_progress + 5 pending).`)
    console.log(`[seed] Total tareas en proyecto dummy: ${allTasks.length}`)
    console.log(`[seed] Usuario para login: ${SEED_EMAIL} / ${SEED_PASSWORD}`)
}

const clean = async (): Promise<void> => {
    const userRepo = AppDataSource.getRepository(UserEntity)
    const user = await userRepo.findOne({ where: { email: SEED_EMAIL } })
    if (!user) {
        console.log(`[clean] Usuario ${SEED_EMAIL} no existe. Nada que limpiar.`)
        return
    }
    const project = await findDummyProject(user.id)
    if (!project) {
        console.log(`[clean] Proyecto dummy no existe. Nada que limpiar.`)
        return
    }
    const projectRepo = AppDataSource.getRepository(ProjectEntity)
    await projectRepo.delete({ id_project: project.id_project })
    console.log(`[clean] Proyecto dummy eliminado (CASCADE borra tareas). id=${project.id_project}`)
}

const main = async (): Promise<void> => {
    const isClean = process.argv.includes("--clean")
    await AppDataSource.initialize()
    try {
        if (isClean) {
            await clean()
        } else {
            await seed()
        }
    } finally {
        await AppDataSource.destroy()
    }
}

main()
    .then(() => {
        console.log("[seed] OK")
        process.exit(0)
    })
    .catch((err) => {
        console.error("[seed] ERROR:", err)
        process.exit(1)
    })
