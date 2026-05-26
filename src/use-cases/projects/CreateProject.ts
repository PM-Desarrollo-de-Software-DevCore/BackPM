import { createProject } from "../../infrastructure/repositories/ProjectRepository"
import { findUserById } from "../../infrastructure/repositories/UserRepository"
import { Project, ProjectPriority, ProjectStatus, ProjectMethodology, ProjectBillingModel } from "../../entities/Project"
import { GlobalRole } from "../../entities/User"
import { notifyProjectCreated } from "../../infrastructure/services/notificationService"

export const createProjectUseCase = async (
    name: string,
    description: string | null,
    client: string,
    project_type: string,
    methodology: ProjectMethodology,
    estimated_sprints: number | null,
    budget: number | null,
    monthly_cost: number | null,
    billing_model: ProjectBillingModel | null,
    start_date: Date,
    end_date: Date | null,
    priority: ProjectPriority,
    status: ProjectStatus,
    userId: string
): Promise<Project> => {
    const user = await findUserById(userId)

    if (!user) {
        throw new Error("Usuario no encontrado")
    }

    if (user.globalRole !== GlobalRole.ADMIN) {
        throw new Error("Solo administradores pueden crear proyectos")
    }

    if (end_date && start_date > end_date) {
        throw new Error("La fecha de inicio debe ser anterior a la fecha de fin")
    }

    const project = await createProject({
        name,
        description,
        client,
        project_type,
        methodology,
        estimated_sprints: estimated_sprints ?? null,
        budget: budget ?? null,
        monthly_cost: monthly_cost ?? null,
        billing_model: billing_model ?? null,
        start_date,
        end_date,
        priority,
        status,
        createdBy: userId
    })

    await notifyProjectCreated(project.id_project, userId)

    return project
}