export enum ProjectStatus {
    ACTIVE = "active",
    FINISHED = "finished",
    PAUSED = "paused"
}

export interface Project {
    id_project: string
    name: string
    description: string | null
    start_date: Date
    end_date: Date | null
    status: ProjectStatus
    createdBy: string
    createdAt: Date
}