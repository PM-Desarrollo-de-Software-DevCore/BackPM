export enum ProgressEntryType {
    PROGRESS = "progress",
    BLOCKER = "blocker"
}

export interface ProgressEntry {
    id_entry: string,
    type: ProgressEntryType,
    description: string,
    date: Date,
    id_project: string,
    id_sprint: string | null,
    createdBy: string,
    createdAt: Date
}
