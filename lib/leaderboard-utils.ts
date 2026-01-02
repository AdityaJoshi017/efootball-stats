import type { Player } from "./use-players"

// Calculate consistency rating (0-100) based on how consistent a player's performance is
export const calculateConsistencyRating = (player: Player): number => {
  // Consistency is based on how close their per-match stats are to their overall average
  const avgGoalsPerMatch = player.gPm
  const avgAssistsPerMatch = player.aPm

  // Higher consistency if both stats are balanced and high
  const balance = Math.min(avgGoalsPerMatch, avgAssistsPerMatch) / Math.max(avgGoalsPerMatch, avgAssistsPerMatch)
  const efficiency = (avgGoalsPerMatch + avgAssistsPerMatch) / 2

  return Math.round((balance * 50 + efficiency * 50) * 100)
}

// Calculate overall player rating (0-100)
export const calculatePlayerRating = (player: Player): number => {
  const goalScore = Math.min(player.gPm * 100, 100)
  const assistScore = Math.min(player.aPm * 100, 100)
  const experienceScore = Math.min((player.apps / 1500) * 100, 100)
  const efficiencyScore = Math.min(player.gAPm * 50, 100)

  return Math.round((goalScore + assistScore + experienceScore + efficiencyScore) / 4)
}

// Get stat trend (up, down, stable)
export const getStatTrend = (player: Player): "up" | "down" | "stable" => {
  const efficiency = player.gAPm
  if (efficiency > 0.8) return "up"
  if (efficiency < 0.3) return "down"
  return "stable"
}

// Find best player combinations for teams
export const findBestCombinations = (players: Player[], teamSize = 2): Player[][] => {
  const combinations: Player[][] = []

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      if (teamSize === 2) {
        combinations.push([players[i], players[j]])
      }
    }
  }

  // Sort by combined rating
  return combinations
    .sort((a, b) => {
      const ratingA = a.reduce((sum, p) => sum + calculatePlayerRating(p), 0)
      const ratingB = b.reduce((sum, p) => sum + calculatePlayerRating(p), 0)
      return ratingB - ratingA
    })
    .slice(0, 5)
}

// Get head-to-head comparison between top 2 players in a category
export const getHeadToHead = (players: Player[], statKey: keyof Player) => {
  const sorted = [...players].sort((a, b) => (b[statKey] as number) - (a[statKey] as number))
  return [sorted[0], sorted[1]].filter(Boolean)
}

// Export rankings as CSV
export const exportRankingsAsCSV = (players: Player[], category: string): string => {
  const headers = ["Rank", "Name", "Team", "Position", "Age", "Card Type", "Value"]
  const rows = players.map((player, index) => [
    index + 1,
    player.name,
    player.team,
    player.position,
    player.age,
    player.cardType,
    player[category as keyof Player],
  ])

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
  return csv
}

// Download CSV file
export const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}
