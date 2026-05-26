import "reflect-metadata"
import { AppDataSource } from "../infrastructure/db/DataSource"
import { UserEntity } from "../infrastructure/db/entities/UserEntity"
import { ProjectEntity } from "../infrastructure/db/entities/ProjectEntity"
import { SprintEntity } from "../infrastructure/db/entities/SprintEntity"
import { TaskEntity } from "../infrastructure/db/entities/TaskEntity"
import { MemberProjectEntity } from "../infrastructure/db/entities/MemberProjectEntity"
import { ProjectStatus, ProjectPriority } from "../entities/Project"
import { SprintStatus } from "../entities/Sprint"
import { TaskStatus, TaskPriority } from "../entities/Task"
import { ProjectRole } from "../entities/MemberProject"

const DEMO_PREFIX = "[DEMO]"

type ProjectSpec = {
    name: string
    status: ProjectStatus
    priority: ProjectPriority
    startOffsetDays: number
    endOffsetDays: number | null
}

const PROJECT_SPECS: ProjectSpec[] = [
    { name: `${DEMO_PREFIX} Alpha`,   status: ProjectStatus.PLANNING,    priority: ProjectPriority.HIGH,   startOffsetDays: 0,   endOffsetDays: 60 },
    { name: `${DEMO_PREFIX} Beta`,    status: ProjectStatus.IN_PROGRESS, priority: ProjectPriority.MEDIUM, startOffsetDays: -20, endOffsetDays: 40 },
    { name: `${DEMO_PREFIX} Gamma`,   status: ProjectStatus.IN_PROGRESS, priority: ProjectPriority.HIGH,   startOffsetDays: -10, endOffsetDays: 50 },
    { name: `${DEMO_PREFIX} Delta`,   status: ProjectStatus.COMPLETED,   priority: ProjectPriority.LOW,    startOffsetDays: -90, endOffsetDays: -10 },
    { name: `${DEMO_PREFIX} Epsilon`, status: ProjectStatus.IN_PROGRESS, priority: ProjectPriority.MEDIUM, startOffsetDays: -5,  endOffsetDays: 25 }
]

const SPRINT_STATUS_CYCLE: SprintStatus[] = [
    SprintStatus.PLANNED,
    SprintStatus.ACTIVE,
    SprintStatus.ACTIVE,
    SprintStatus.FINISHED,
    SprintStatus.PLANNED
]

const TASK_STATUS_CYCLE: TaskStatus[] = [
    TaskStatus.PENDING,
    TaskStatus.IN_PROGRESS,
    TaskStatus.COMPLETED,
    TaskStatus.COMPLETED,
    TaskStatus.IN_PROGRESS
]

const TASK_PRIORITY_CYCLE: TaskPriority[] = [
    TaskPriority.LOW,
    TaskPriority.MEDIUM,
    TaskPriority.HIGH,
    TaskPriority.MEDIUM,
    TaskPriority.HIGH
]

const ROLES_CYCLE: ProjectRole[] = [
    ProjectRole.PROJECT_MANAGER,
    ProjectRole.SCRUM_MASTER,
    ProjectRole.DEVELOPER,
    ProjectRole.DEVELOPER,
    ProjectRole.DEVELOPER
]

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}

const randomBusinessHourDate = (baseDay: Date): Date => {
    const result = new Date(baseDay)
    const hour = 9 + Math.floor(Math.random() * 9)
    const minute = Math.floor(Math.random() * 60)
    result.setHours(hour, minute, 0, 0)
    return result
}

const loadExistingUsers = async (): Promise<UserEntity[]> => {
    const userRepo = AppDataSource.getRepository(UserEntity)
    const users = await userRepo.find({ order: { createdAt: "ASC" }, take: 5 })
    if (users.length === 0) {
        throw new Error("No hay usuarios en la base de datos. Crea al menos uno antes de correr este seed.")
    }
    return users
}

const findOrCreateProject = async (spec: ProjectSpec, ownerId: string): Promise<ProjectEntity> => {
    const projectRepo = AppDataSource.getRepository(ProjectEntity)
    const today = new Date()
    const existing = await projectRepo.findOne({ where: { name: spec.name } })
    if (existing) {
        existing.status = spec.status
        existing.priority = spec.priority
        existing.start_date = addDays(today, spec.startOffsetDays)
        existing.end_date = spec.endOffsetDays !== null ? addDays(today, spec.endOffsetDays) : null
        const saved = await projectRepo.save(existing)
        console.log(`[seed] Proyecto reutilizado: ${saved.name} (${saved.id_project})`)
        return saved
    }
    const created = projectRepo.create({
        name: spec.name,
        description: `Proyecto demo generado por seedFullDemo (${spec.status} / ${spec.priority}).`,
        start_date: addDays(today, spec.startOffsetDays),
        end_date: spec.endOffsetDays !== null ? addDays(today, spec.endOffsetDays) : null,
        status: spec.status,
        priority: spec.priority,
        createdBy: ownerId
    })
    const saved = await projectRepo.save(created)
    console.log(`[seed] Proyecto creado: ${saved.name} (${saved.id_project})`)
    return saved
}

const replaceMembers = async (projectId: string, users: UserEntity[]): Promise<void> => {
    const memberRepo = AppDataSource.getRepository(MemberProjectEntity)
    await memberRepo.delete({ id_project: projectId })
    const members = users.map((user, idx) =>
        memberRepo.create({
            id_user: user.id,
            id_project: projectId,
            role: ROLES_CYCLE[idx % ROLES_CYCLE.length]!
        })
    )
    await memberRepo.save(members)
}

const replaceSprint = async (projectId: string, index: number): Promise<SprintEntity> => {
    const sprintRepo = AppDataSource.getRepository(SprintEntity)
    await sprintRepo.delete({ id_project: projectId })
    const today = new Date()
    const status = SPRINT_STATUS_CYCLE[index % SPRINT_STATUS_CYCLE.length]!
    const sprint = sprintRepo.create({
        name: `Sprint Demo #${index + 1}`,
        start_date: addDays(today, -7),
        end_date: addDays(today, 14),
        status,
        id_project: projectId
    })
    return await sprintRepo.save(sprint)
}

const replaceTasks = async (
    projectId: string,
    sprintId: string,
    users: UserEntity[],
    startingNumber: number,
    projectIndex: number
): Promise<{ inserted: number; completed: number }> => {
    const taskRepo = AppDataSource.getRepository(TaskEntity)
    await taskRepo.delete({ id_project: projectId })

    const today = new Date()
    const tasks: TaskEntity[] = []
    let completed = 0

    for (let i = 0; i < 5; i++) {
        const status = TASK_STATUS_CYCLE[i % TASK_STATUS_CYCLE.length]!
        const priority = TASK_PRIORITY_CYCLE[i % TASK_PRIORITY_CYCLE.length]!
        const assignee = users[(i + projectIndex) % users.length]!
        const isCompleted = status === TaskStatus.COMPLETED
        if (isCompleted) completed++

        tasks.push(
            taskRepo.create({
                title: `Demo Task #${startingNumber + i}`,
                description: `Tarea demo en estado ${status} con prioridad ${priority}.`,
                task_number: startingNumber + i,
                progress: isCompleted ? 100 : status === TaskStatus.IN_PROGRESS ? 50 : 0,
                story_points: [1, 2, 3, 5, 8][i % 5]!,
                status,
                priority,
                end_date: isCompleted ? null : addDays(today, 5 + i * 2),
                completedAt: isCompleted ? randomBusinessHourDate(addDays(today, -i)) : null,
                id_project: projectId,
                id_sprint: i < 3 ? sprintId : null,
                createdBy: users[0]!.id,
                assignedTo: assignee.id
            })
        )
    }

    await taskRepo.save(tasks, { chunk: 25 })
    return { inserted: tasks.length, completed }
}

const seed = async (): Promise<void> => {
    const users = await loadExistingUsers()
    console.log(`[seed] Usando ${users.length} usuario(s) existentes:`)
    users.forEach((u) => console.log(`        - ${u.email} (${u.id})`))

    let taskCounter = 1
    let totalTasks = 0
    let totalCompleted = 0

    for (let i = 0; i < PROJECT_SPECS.length; i++) {
        const spec = PROJECT_SPECS[i]!
        const project = await findOrCreateProject(spec, users[0]!.id)
        await replaceMembers(project.id_project, users)
        const sprint = await replaceSprint(project.id_project, i)
        const { inserted, completed } = await replaceTasks(project.id_project, sprint.id_sprint, users, taskCounter, i)
        taskCounter += inserted
        totalTasks += inserted
        totalCompleted += completed
        console.log(`[seed] ${project.name}: sprint ${sprint.status}, ${inserted} tareas (${completed} completed)`)
    }

    console.log(`[seed] Total proyectos: ${PROJECT_SPECS.length}`)
    console.log(`[seed] Total tareas insertadas: ${totalTasks} (${totalCompleted} completed)`)
}

const clean = async (): Promise<void> => {
    const projectRepo = AppDataSource.getRepository(ProjectEntity)
    const taskRepo = AppDataSource.getRepository(TaskEntity)
    const sprintRepo = AppDataSource.getRepository(SprintEntity)
    const memberRepo = AppDataSource.getRepository(MemberProjectEntity)

    const demoProjects = await projectRepo
        .createQueryBuilder("p")
        .where("p.name LIKE :prefix", { prefix: `${DEMO_PREFIX}%` })
        .getMany()

    if (demoProjects.length === 0) {
        console.log(`[clean] No hay proyectos demo. Nada que limpiar.`)
        return
    }

    for (const project of demoProjects) {
        await taskRepo.delete({ id_project: project.id_project })
        await sprintRepo.delete({ id_project: project.id_project })
        await memberRepo.delete({ id_project: project.id_project })
        await projectRepo.delete({ id_project: project.id_project })
        console.log(`[clean] Proyecto demo eliminado: ${project.name} (${project.id_project})`)
    }
}

const preview = async (): Promise<void> => {
    const users = await loadExistingUsers()
    console.log(`[preview] Los siguientes ${users.length} usuario(s) serán usados como members/assignees:`)
    users.forEach((u, idx) => {
        console.log(`        ${idx + 1}. ${u.email} - ${u.name} ${u.lastname} (id=${u.id}, createdAt=${u.createdAt.toISOString()})`)
    })
    console.log(`[preview] No se hicieron cambios en la DB.`)
}

const main = async (): Promise<void> => {
    const isClean = process.argv.includes("--clean")
    const isPreview = process.argv.includes("--preview")
    await AppDataSource.initialize()
    try {
        if (isPreview) {
            await preview()
        } else if (isClean) {
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
