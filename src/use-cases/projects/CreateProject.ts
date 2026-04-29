import { createProject } from "../../infrastructure/repositories/ProjectRepository"
import { Project, ProjectStatus } from "../../entities/Project"

export const createProjectUseCase = async (name: string,description: string | null,start_date: Date,end_date: Date | null,status: ProjectStatus,userId: string): Promise<Project> => {
    if (end_date && start_date > end_date) {
        throw new Error("La fecha de inicio debe ser anterior a la fecha de fin")
    }

    const project = await createProject({
        name,
        description,
        start_date,
        end_date,
        status,
        createdBy: userId
    })

    return project
}