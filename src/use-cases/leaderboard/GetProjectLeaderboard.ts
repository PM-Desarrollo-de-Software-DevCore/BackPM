import { getLeaderboardByProject } from "../../infrastructure/repositories/UserRepository"
import { isMemberProject } from "../../infrastructure/repositories/MemberProjectRepository"
import { LeaderboardEntry } from "./GetGlobalLeaderboard"

export const getProjectLeaderboardUseCase = async (
    projectId: string,
    requesterId: string,
    limit: number
): Promise<LeaderboardEntry[]> => {
    const isMember = await isMemberProject(requesterId, projectId)
    if (!isMember) {
        throw new Error("No tienes acceso a este proyecto")
    }

    const users = await getLeaderboardByProject(projectId, limit)
    return users.map((u) => ({
        userId: u.id,
        name: u.name,
        lastname: u.lastname,
        profileImageUrl: u.profileImageUrl ?? null,
        points: u.points ?? 0
    }))
}
