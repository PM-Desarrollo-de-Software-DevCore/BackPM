export interface Milestone {
    id_milestone: string,
    title: string,
    description: string | null,
    due_date: Date,
    completedAt: Date | null,
    id_project: string,
    createdBy: string,
    createdAt: Date
}
