import { getLeaderboard } from "../../infrastructure/repositories/UserRepository"

export interface LeaderboardEntry {
    userId: string
    name: string
    lastname: string
    profileImageUrl: string | null
    points: number
}

export const getGlobalLeaderboardUseCase = async (limit: number): Promise<LeaderboardEntry[]> => {
    const users = await getLeaderboard(limit)
    return users.map((u) => ({
        userId: u.id,
        name: u.name,
        lastname: u.lastname,
        profileImageUrl: u.profileImageUrl ?? null,
        points: u.points ?? 0
    }))
}
