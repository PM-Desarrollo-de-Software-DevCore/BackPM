export enum ProjectPriority {
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}

export enum ProjectMethodology {
    SCRUM = "scrum",
    KANBAN = "kanban"
}

export enum ProjectBillingModel {
    FIXED_PRICE = "fixed_price",
    TIME_AND_MATERIALS = "time_and_materials",
    RETAINER = "retainer"
}

export enum ProjectStatus {
    PLANNING = "planning",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed"
}

export interface Project {
    id_project: string
    name: string
    description: string | null
    client: string
    project_type: string
    methodology: ProjectMethodology
    estimated_sprints: number | null
    budget: number | null
    monthly_cost: number | null
    billing_model: ProjectBillingModel | null
    start_date: Date
    end_date: Date | null
    priority: ProjectPriority
    status: ProjectStatus
    createdBy: string
    createdAt: Date
}