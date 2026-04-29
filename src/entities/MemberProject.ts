export enum ProjectRole {
    PROJECT_MANAGER = "project_manager",
    SCRUM_MASTER =  "scrum_master",
    DEVELOPER = "developer"
}

export interface MemberProject {
    id_mp: string,
    id_user: string,
    id_project: string,
    role: ProjectRole
}


