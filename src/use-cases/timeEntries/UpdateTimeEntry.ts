import { getTimeEntryById, updateTimeEntry } from "../../infrastructure/repositories/TimeEntryRepository"
import { GlobalRole } from "../../entities/User"
import { TimeEntry } from "../../entities/TimeEntry"

export interface TimeEntryUpdates {
    hours?: number
    work_date?: Date
    description?: string | null
}

export const updateTimeEntryUseCase = async (
    timeEntryId: string,
    userId: string,
    globalRole: GlobalRole,
    updates: TimeEntryUpdates
): Promise<TimeEntry | null> => {
    const existing = await getTimeEntryById(timeEntryId)
    if (!existing) {
        throw new Error("Registro de tiempo no encontrado")
    }

    // Solo el autor (o un admin global) puede editar.
    if (existing.id_user !== userId && globalRole !== "admin") {
        throw new Error("Solo el autor o un administrador puede editar este registro")
    }

    if (updates.hours !== undefined && !(updates.hours > 0)) {
        throw new Error("Las horas deben ser mayores a 0")
    }

    // Solo actualizamos los campos provistos (undefined = no tocar).
    const data: Partial<Pick<TimeEntry, "hours" | "work_date" | "description">> = {}
    if (updates.hours !== undefined) data.hours = updates.hours
    if (updates.work_date !== undefined) data.work_date = updates.work_date
    if (updates.description !== undefined) data.description = updates.description

    const updated = await updateTimeEntry(timeEntryId, data)
    if (!updated) {
        throw new Error("No se pudo actualizar el registro de tiempo")
    }
    return updated
}
