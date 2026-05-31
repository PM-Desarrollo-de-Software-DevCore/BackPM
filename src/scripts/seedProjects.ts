import "reflect-metadata"
import { AppDataSource } from "../infrastructure/db/DataSource"
import { UserEntity } from "../infrastructure/db/entities/UserEntity"
import { ProjectEntity } from "../infrastructure/db/entities/ProjectEntity"
import { GlobalRole } from "../entities/User"
import { ProjectBillingModel, ProjectMethodology, ProjectPriority, ProjectStatus } from "../entities/Project"

type ProjectSeed = {
    name: string
    client: string
    project_type: string
    project_objective: string
    methodology: ProjectMethodology
    estimated_sprints: number | null
    budget: number | null
    monthly_cost: number | null
    billing_model: ProjectBillingModel | null
    priority: ProjectPriority
    status: ProjectStatus
    startOffsetDays: number
    endOffsetDays: number | null
}

const PROJECT_SEEDS: ProjectSeed[] = [
    {
        name: "[SEED] Atlas Platform",
        client: "Atlas Foods",
        project_type: "Web platform",
        project_objective: "Lanzar una plataforma central para ventas y operaciones.",
        methodology: ProjectMethodology.SCRUM,
        estimated_sprints: 6,
        budget: 28000,
        monthly_cost: null,
        billing_model: ProjectBillingModel.FIXED_PRICE,
        priority: ProjectPriority.HIGH,
        status: ProjectStatus.PLANNING,
        startOffsetDays: -10,
        endOffsetDays: 70
    },
    {
        name: "[SEED] Boreal Mobile",
        client: "Boreal Health",
        project_type: "Mobile app",
        project_objective: "Mejorar el acceso móvil a servicios de salud.",
        methodology: ProjectMethodology.KANBAN,
        estimated_sprints: null,
        budget: null,
        monthly_cost: 4500,
        billing_model: ProjectBillingModel.RETAINER,
        priority: ProjectPriority.MEDIUM,
        status: ProjectStatus.IN_PROGRESS,
        startOffsetDays: -20,
        endOffsetDays: 45
    },
    {
        name: "[SEED] Cinder Ops",
        client: "Cinder Logistics",
        project_type: "Internal tooling",
        project_objective: "Automatizar flujos internos y reportes operativos.",
        methodology: ProjectMethodology.SCRUM,
        estimated_sprints: 4,
        budget: 16000,
        monthly_cost: null,
        billing_model: ProjectBillingModel.FIXED_PRICE,
        priority: ProjectPriority.HIGH,
        status: ProjectStatus.IN_PROGRESS,
        startOffsetDays: -30,
        endOffsetDays: 30
    },
    {
        name: "[SEED] Drift Commerce",
        client: "Drift Commerce",
        project_type: "E-commerce",
        project_objective: "Optimizar la experiencia de compra y conversión.",
        methodology: ProjectMethodology.KANBAN,
        estimated_sprints: null,
        budget: null,
        monthly_cost: 6200,
        billing_model: ProjectBillingModel.TIME_AND_MATERIALS,
        priority: ProjectPriority.MEDIUM,
        status: ProjectStatus.PLANNING,
        startOffsetDays: -5,
        endOffsetDays: 60
    },
    {
        name: "[SEED] Ember Insights",
        client: "Ember Analytics",
        project_type: "Analytics suite",
        project_objective: "Consolidar métricas clave para toma de decisiones.",
        methodology: ProjectMethodology.SCRUM,
        estimated_sprints: 8,
        budget: 42000,
        monthly_cost: null,
        billing_model: ProjectBillingModel.FIXED_PRICE,
        priority: ProjectPriority.HIGH,
        status: ProjectStatus.IN_PROGRESS,
        startOffsetDays: -15,
        endOffsetDays: 75
    },
    {
        name: "[SEED] Flux Support",
        client: "Flux Studio",
        project_type: "Support portal",
        project_objective: "Centralizar tickets y autoservicio para clientes.",
        methodology: ProjectMethodology.KANBAN,
        estimated_sprints: null,
        budget: null,
        monthly_cost: 3100,
        billing_model: ProjectBillingModel.RETAINER,
        priority: ProjectPriority.LOW,
        status: ProjectStatus.IN_PROGRESS,
        startOffsetDays: -40,
        endOffsetDays: 20
    },
    {
        name: "[SEED] Grove CRM",
        client: "Grove Realty",
        project_type: "CRM",
        project_objective: "Unificar la gestión de leads y relaciones comerciales.",
        methodology: ProjectMethodology.SCRUM,
        estimated_sprints: 5,
        budget: 21000,
        monthly_cost: null,
        billing_model: ProjectBillingModel.FIXED_PRICE,
        priority: ProjectPriority.MEDIUM,
        status: ProjectStatus.COMPLETED,
        startOffsetDays: -120,
        endOffsetDays: -15
    },
    {
        name: "[SEED] Harbor Admin",
        client: "Harbor Fintech",
        project_type: "Admin panel",
        project_objective: "Dar visibilidad operativa a equipos internos.",
        methodology: ProjectMethodology.KANBAN,
        estimated_sprints: null,
        budget: null,
        monthly_cost: 5400,
        billing_model: ProjectBillingModel.TIME_AND_MATERIALS,
        priority: ProjectPriority.HIGH,
        status: ProjectStatus.IN_PROGRESS,
        startOffsetDays: -25,
        endOffsetDays: 55
    },
    {
        name: "[SEED] Ivory Scheduler",
        client: "Ivory Education",
        project_type: "Scheduling system",
        project_objective: "Organizar agendas y disponibilidad en tiempo real.",
        methodology: ProjectMethodology.SCRUM,
        estimated_sprints: 7,
        budget: 30000,
        monthly_cost: null,
        billing_model: ProjectBillingModel.FIXED_PRICE,
        priority: ProjectPriority.LOW,
        status: ProjectStatus.PLANNING,
        startOffsetDays: 0,
        endOffsetDays: 90
    },
    {
        name: "[SEED] Juniper Data",
        client: "Juniper Labs",
        project_type: "Data platform",
        project_objective: "Construir una base de datos analítica escalable.",
        methodology: ProjectMethodology.KANBAN,
        estimated_sprints: null,
        budget: null,
        monthly_cost: 7800,
        billing_model: ProjectBillingModel.RETAINER,
        priority: ProjectPriority.MEDIUM,
        status: ProjectStatus.IN_PROGRESS,
        startOffsetDays: -8,
        endOffsetDays: 52
    }
]

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}

const loadOwner = async (): Promise<UserEntity> => {
    const userRepo = AppDataSource.getRepository(UserEntity)
    const owner = await userRepo.findOne({ where: { globalRole: GlobalRole.ADMIN }, order: { createdAt: "ASC" } })

    if (owner) {
        return owner
    }

    const fallback = await userRepo.findOne({ order: { createdAt: "ASC" } })
    if (!fallback) {
        throw new Error("No hay usuarios en la base de datos. Crea al menos uno antes de correr este seed.")
    }

    return fallback
}

const upsertProject = async (seed: ProjectSeed, ownerId: string): Promise<ProjectEntity> => {
    const projectRepo = AppDataSource.getRepository(ProjectEntity)
    const today = new Date()
    const existing = await projectRepo.findOne({ where: { name: seed.name } })

    const payload = {
        name: seed.name,
        description: `Registro de prueba para ${seed.client} (${seed.project_type}).`,
        client: seed.client,
        project_type: seed.project_type,
        project_objective: seed.project_objective,
        methodology: seed.methodology,
        estimated_sprints: seed.estimated_sprints,
        budget: seed.budget,
        monthly_cost: seed.monthly_cost,
        billing_model: seed.billing_model,
        start_date: addDays(today, seed.startOffsetDays),
        end_date: seed.endOffsetDays !== null ? addDays(today, seed.endOffsetDays) : null,
        priority: seed.priority,
        status: seed.status,
        createdBy: ownerId
    }

    if (existing) {
        Object.assign(existing, payload)
        return await projectRepo.save(existing)
    }

    const created = projectRepo.create(payload)
    return await projectRepo.save(created)
}

const main = async (): Promise<void> => {
    await AppDataSource.initialize()
    try {
        const owner = await loadOwner()
        for (const seed of PROJECT_SEEDS) {
            const saved = await upsertProject(seed, owner.id)
            console.log(`[seed:projects] ${saved.name} (${saved.id_project})`)
        }
        console.log(`[seed:projects] Total insertados/actualizados: ${PROJECT_SEEDS.length}`)
    } finally {
        await AppDataSource.destroy()
    }
}

main()
    .then(() => {
        console.log("[seed:projects] OK")
        process.exit(0)
    })
    .catch((error) => {
        console.error("[seed:projects] ERROR:", error)
        process.exit(1)
    })