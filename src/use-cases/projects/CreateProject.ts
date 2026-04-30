import { createProject } from "../../infrastructure/repositories/ProjectRepository"
import { findUserById } from "../../infrastructure/repositories/UserRepository"
import { Project, ProjectPriority, ProjectStatus } from "../../entities/Project"
import { GlobalRole } from "../../entities/User"

export const createProjectUseCase = async (
    name: string,
    description: string | null,
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

    return await createProject({
        name,
        description,
        start_date,
        end_date,
        priority,
        status,
        createdBy: userId
    })
}