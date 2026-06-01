export interface TimeEntry {
    id_time_entry: string,
    id_task: string,
    id_user: string,
    id_project: string,
    hours: number,
    work_date: Date,
    description: string | null,
    createdAt: Date
}
