import type { Player } from "./players-data"

export type LeaderboardBadge = {
  key: string
  label: string
  emoji: string
  statKey: keyof Player
  rank: number
}

export function selectBestBadge(badges: LeaderboardBadge[]): LeaderboardBadge | null {
  if (badges.length === 0) return null

  const priority: Record<string, number> = {
    goals: 1,
    assists: 2,
    contribution: 3,
    efficiency: 4,
    goals_per_match: 5,
    apps: 6,
    assists_per_match: 7,
  }

  return [...badges].sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank
    return (priority[a.key] ?? 999) - (priority[b.key] ?? 999)
  })[0]
}

const BADGE_DEFS: Array<{
  key: string
  label: string
  emoji: string
  statKey: keyof Player
  sort: (p: Player) => number
}> = [
  { key: "goals", label: "Goals", emoji: "⚽", statKey: "goal", sort: (p) => p.goal },
  { key: "assists", label: "Assists", emoji: "🅰️", statKey: "assists", sort: (p) => p.assists },
  { key: "contribution", label: "G+A", emoji: "🔥", statKey: "gPlusA", sort: (p) => p.gPlusA },
  { key: "efficiency", label: "G+A/Match", emoji: "💥", statKey: "gAPm", sort: (p) => p.gAPm },
  { key: "goals_per_match", label: "Goals/Match", emoji: "🎯", statKey: "gPm", sort: (p) => p.gPm },
  { key: "apps", label: "Appearances", emoji: "🎮", statKey: "apps", sort: (p) => p.apps },
  { key: "assists_per_match", label: "Assists/Match", emoji: "🧠", statKey: "aPm", sort: (p) => p.aPm },
]

export function buildLeaderboardBadges(players: Player[], topN = 10): Map<number, LeaderboardBadge[]> {
  const result = new Map<number, LeaderboardBadge[]>()

  for (const def of BADGE_DEFS) {
    const sorted = [...players].sort((a, b) => def.sort(b) - def.sort(a)).slice(0, topN)
    sorted.forEach((player, idx) => {
      const badge: LeaderboardBadge = {
        key: def.key,
        label: def.label,
        emoji: def.emoji,
        statKey: def.statKey,
        rank: idx + 1,
      }

      const existing = result.get(player.id) ?? []
      existing.push(badge)
      result.set(player.id, existing)
    })
  }

  for (const [playerId, badges] of result.entries()) {
    badges.sort((a, b) => a.rank - b.rank)
    result.set(playerId, badges)
  }

  return result
}

export function getPlayerBadges(players: Player[], playerId: number, topN = 10): LeaderboardBadge[] {
  return buildLeaderboardBadges(players, topN).get(playerId) ?? []
}

export function getBestPlayerBadge(players: Player[], playerId: number, topN = 10): LeaderboardBadge | null {
  const badges = getPlayerBadges(players, playerId, topN)
  return selectBestBadge(badges)
}
