export enum ProjectPriority {
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
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
    start_date: Date
    end_date: Date | null
    priority: ProjectPriority
    status: ProjectStatus
    createdBy: string
    createdAt: Date
}