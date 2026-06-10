import bcrypt from "bcrypt"
import { randomUUID } from "crypto"
import { EntityManager } from "typeorm"

import { AppDataSource } from "../../infrastructure/db/DataSource"
import { UserEntity } from "../../infrastructure/db/entities/UserEntity"
import { TaskEntity } from "../../infrastructure/db/entities/TaskEntity"
import { ProjectEntity } from "../../infrastructure/db/entities/ProjectEntity"
import { MilestoneEntity } from "../../infrastructure/db/entities/MilestoneEntity"
import { CommentEntity } from "../../infrastructure/db/entities/CommentEntity"
import { TimeEntryEntity } from "../../infrastructure/db/entities/TimeEntryEntity"
import { ProgressEntryEntity } from "../../infrastructure/db/entities/ProgressEntryEntity"
import { ProfileChangeRequestEntity } from "../../infrastructure/db/entities/ProfileChangeRequestEntity"
import { GlobalRole, GHOST_USER_EMAIL } from "../../entities/User"
import { TaskStatus } from "../../entities/Task"

export const isGhostUserEmail = (email?: string | null): boolean =>
  email === GHOST_USER_EMAIL

export const getOrCreateGhostUser = async (manager: EntityManager): Promise<UserEntity> => {
  const repo = manager.getRepository(UserEntity)

  const existing = await repo.findOne({ where: { email: GHOST_USER_EMAIL } })
  if (existing) {
    return existing
  }

  const ghost = repo.create({
    email: GHOST_USER_EMAIL,
    // Hash de un valor aleatorio: el password nunca se conoce -> login imposible.
    password: await bcrypt.hash(randomUUID(), 10),
    name: "Cuenta",
    lastname: "eliminada",
    globalRole: GlobalRole.USER,
  })

  return await repo.save(ghost)
}

/**
 * Elimina un usuario reasignando su historial al perfil ghost y dejando lo
 * pendiente sin asignar:
 *  - Tareas asignadas SIN completar  -> sin asignar (assignedTo = null) y al backlog (id_sprint = null).
 *  - Tareas asignadas COMPLETADAS    -> reasignadas al ghost (preserva el trabajo hecho).
 *  - Autorías / actividad histórica  -> reasignadas al ghost (createdBy de tareas,
 *    proyectos, hitos y progress entries; comentarios, work logs y solicitudes).
 *  - Membresías de proyecto y skills -> se eliminan en cascada (estado actual, no historial).
 *
 * Todo ocurre en UNA transacción: o se aplica completo o nada.
 */
export const deleteUserUseCase = async (userId: string): Promise<void> => {
  await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(UserEntity)

    const user = await userRepo.findOne({ where: { id: userId } })
    if (!user) {
      throw new Error("Usuario no encontrado")
    }
    if (isGhostUserEmail(user.email)) {
      throw new Error("No se puede eliminar la cuenta del sistema")
    }

    const taskRepo = manager.getRepository(TaskEntity)

    // 1) Tareas asignadas sin completar -> sin asignar y al backlog.
    await taskRepo
      .createQueryBuilder()
      .update()
      .set({ assignedTo: null, id_sprint: null })
      .where("assignedTo = :userId AND status != :completed", {
        userId,
        completed: TaskStatus.COMPLETED,
      })
      .execute()

    const ghost = await getOrCreateGhostUser(manager)

    // 2) Tareas completadas asignadas -> al ghost.
    await taskRepo.update(
      { assignedTo: userId, status: TaskStatus.COMPLETED },
      { assignedTo: ghost.id }
    )

    // 3) Autorías y actividad histórica -> al ghost (los createdBy son NOT NULL).
    await taskRepo.update({ createdBy: userId }, { createdBy: ghost.id })
    await manager.getRepository(ProjectEntity).update({ createdBy: userId }, { createdBy: ghost.id })
    await manager.getRepository(MilestoneEntity).update({ createdBy: userId }, { createdBy: ghost.id })
    await manager.getRepository(ProgressEntryEntity).update({ createdBy: userId }, { createdBy: ghost.id })
    await manager.getRepository(CommentEntity).update({ id_user: userId }, { id_user: ghost.id })
    await manager.getRepository(TimeEntryEntity).update({ id_user: userId }, { id_user: ghost.id })

    const pcrRepo = manager.getRepository(ProfileChangeRequestEntity)
    await pcrRepo.update({ reviewedBy: userId }, { reviewedBy: ghost.id })
    await pcrRepo.update({ id_user: userId }, { id_user: ghost.id })

    // 4) member_project y user_technologies tienen ON DELETE CASCADE: se eliminan
    //    solos al borrar el usuario (son estado actual, no historial).
    await userRepo.delete({ id: userId })
  })
}
