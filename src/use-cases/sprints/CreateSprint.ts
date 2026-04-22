import { createSprint} from "../../infrastructure/repositories/SprintRepository"
import { getUserRoleInProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { Sprint, SprintStatus } from "../../entities/Sprint"
import { LessThanOrEqual } from "typeorm"

export const createSprintUseCase = async ( name: string, start_date: Date, end_date: Date, status: SprintStatus, id_project: string, userId: string): Promise<Sprint> => {

    const userRole = await getUserRoleInProject(userId, id_project)

    if (!userRole) {
        throw new Error("No tienes permisos en este proyecto")
    }

    if (userRole !== "scrum_master") {
        throw new Error("Solo scrum_master puede crear sprints")
    }
    
    // Se valida fecha valida
    if (start_date > end_date) {
        throw new Error("La fecha de inicio debe ser anterior a la fecha de fin")
    }

    //Valida que no haya fechas pasadas
    if (start_date < new Date()) {
        throw new Error("La fecha de inicio no puede ser en el pasado")
    }

    return await createSprint({
        name, 
        start_date,
        end_date,
        status,
        id_project
    })
}


   