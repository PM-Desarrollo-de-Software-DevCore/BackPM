export enum ProjectRole {
    PROJECT_MANAGER = "project_manager",
    SCRUM_MASTER =  "scrum_master",
    DEVELOPER = "developer",
    TEAM_LEAD = "team_lead"
}

export interface MemberProject {
    id_mp: string,
    id_user: string,
    id_project: string,
    role: ProjectRole,
    fte: number | null,
    monthly_rate: number | null,
    // Tarifa de venta por hora facturada al cliente (revenue, T&M). Independiente
    // del costo (monthly_rate); juntas dan margen. Sensible: solo admin/PM.
    sale_rate: number | null
}


