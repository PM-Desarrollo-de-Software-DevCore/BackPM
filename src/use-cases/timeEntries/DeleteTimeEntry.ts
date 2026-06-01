import { getTimeEntryById, deleteTimeEntry } from "../../infrastructure/repositories/TimeEntryRepository"
import { GlobalRole } from "../../entities/User"

export const deleteTimeEntryUseCase = async (
    timeEntryId: string,
    userId: string,
    globalRole: GlobalRole
): Promise<{ deleted: boolean }> => {
    const existing = await getTimeEntryById(timeEntryId)
    if (!existing) {
        throw new Error("Registro de tiempo no encontrado")
    }

    // Solo el autor (o un admin global) puede eliminar.
    if (existing.id_user !== userId && globalRole !== "admin") {
        throw new Error("Solo el autor o un administrador puede eliminar este registro")
    }

    const deleted = await deleteTimeEntry(timeEntryId)
    return { deleted }
}
