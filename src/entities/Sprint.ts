export enum SprintStatus {
    PLANNED =  "planned",
    ACTIVE = "active",
    FINISHED = "finished"
}

export interface Sprint {
    id_sprint: string,
    name: string,
    start_date: Date,
    end_date: Date,
    status: SprintStatus,
    id_project: string,
    createdAt: Date
}
