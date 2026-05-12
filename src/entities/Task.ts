export enum TaskStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed"
}

export enum TaskPriority {
    LOW =  "low",
    MEDIUM = "medium",
    HIGH = "high"
}

export interface Task {
    id_task: string,
    title: string,
    description: string | null,
    task_number: number,
    progress: number,
    priority: TaskPriority,
    status: TaskStatus,
    start_date: Date,
    end_date: Date | null,
    id_project: string,
    id_sprint: string | null,
    createdBy: string,
    assignedTo: string | null,
    createdAt: Date
}
