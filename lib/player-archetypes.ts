export interface PlayerArchetype {
  name: string
  emoji: string
  color: string
  description: string
  badge: string
}

export const PLAYER_ARCHETYPES: Record<string, PlayerArchetype> = {
  NONE: {
    name: "",
    emoji: "",
    color: "",
    description: "",
    badge: "",
  },
  GOAT: {
    name: "GOAT",
    emoji: "🐐",
    color: "from-amber-500 to-amber-600",
    description: "Greatest Of All Time - The absolute best player",
    badge: "bg-amber-200 text-amber-900 border-2 border-amber-500",
  },
  GOAL_MACHINE: {
    name: "Specialist",
    emoji: "🥇",
    color: "from-red-500 to-red-600",
    description: "Best goal scoring ratio (goals per match)",
    badge: "bg-red-100 text-red-800",
  },
  TOP_SCORER: {
    name: "Goal Machine",
    emoji: "⚽",
    color: "from-emerald-500 to-emerald-600",
    description: "Most total goals",
    badge: "bg-emerald-100 text-emerald-800",
  },
  PLAYMAKER: {
    name: "Playmaker",
    emoji: "🎯",
    color: "from-blue-500 to-blue-600",
    description: "Creative genius with 150+ assists",
    badge: "bg-blue-100 text-blue-800",
  },
  COMPLETE_LEGEND: {
    name: "Complete Legend",
    emoji: "👑",
    color: "from-yellow-500 to-yellow-600",
    description: "Balanced excellence: 100+ goals AND 100+ assists",
    badge: "bg-yellow-100 text-yellow-800",
  },
  RISING_STAR: {
    name: "Rising Star",
    emoji: "⭐",
    color: "from-purple-500 to-purple-600",
    description: "Young talent (age < 25) with impressive stats",
    badge: "bg-purple-100 text-purple-800",
  },
  VETERAN_LEGEND: {
    name: "Veteran Legend",
    emoji: "🏆",
    color: "from-orange-500 to-orange-600",
    description: "Experienced veteran (age > 30) with proven excellence",
    badge: "bg-orange-100 text-orange-800",
  },
  CLUTCH_PLAYER: {
    name: "Clutch Player",
    emoji: "🔥",
    color: "from-pink-500 to-pink-600",
    description: "High efficiency: G+A per match > 0.8",
    badge: "bg-pink-100 text-pink-800",
  },
  SPECIALIST: {
    name: "Specialist",
    emoji: "🎪",
    color: "from-green-500 to-green-600",
    description: "Master of one skill: extreme in one stat",
    badge: "bg-green-100 text-green-800",
  },
  BALANCED_PERFORMER: {
    name: "Balanced Performer",
    emoji: "⚖️",
    color: "from-cyan-500 to-cyan-600",
    description: "Consistent all-rounder with moderate stats",
    badge: "bg-cyan-100 text-cyan-800",
  },
  ELITE_PERFORMER: {
    name: "Elite Performer",
    emoji: "💎",
    color: "from-indigo-500 to-indigo-600",
    description: "Top 5% overall performance rating",
    badge: "bg-indigo-100 text-indigo-800",
  },
}

export function getGOATPlayer(players: any[]): any | null {
  if (players.length === 0) return null

  // Calculate goal contributions (goals + assists) for each player
  const playersWithScores = players.map((player) => {
    const goalContributions = player.goal + player.assists
    return { player, score: goalContributions }
  })

  // Find the player with the highest goal contributions
  const goat = playersWithScores.reduce((max, current) => (current.score > max.score ? current : max))

  return goat.player
}

export function assignDistinctArchetypes(players: any[]): Map<number, PlayerArchetype> {
  const archetypeAssignments = new Map<number, PlayerArchetype>()
  const assignedPlayers = new Set<number>()

  const sortedPlayers = [...players].sort((a, b) => b.goal + b.assists - (a.goal + a.assists))
  const top15Players = sortedPlayers.slice(0, 15)

  const pickBest = (candidates: any[], score: (p: any) => number) => {
    if (candidates.length === 0) return null
    return candidates.reduce((best, p) => (score(p) > score(best) ? p : best))
  }

  const remaining = () => top15Players.filter((p) => !assignedPlayers.has(p.id))

  // 1) GOAT: highest goal contributions (goals + assists)
  const goatPlayer = getGOATPlayer(top15Players)
  if (goatPlayer) {
    archetypeAssignments.set(goatPlayer.id, PLAYER_ARCHETYPES.GOAT)
    assignedPlayers.add(goatPlayer.id)
  }

  // 2) Goal Machine: best goal scoring ratio (goals per match)
  const goalMachine = pickBest(remaining(), (p) => p.gPm)
  if (goalMachine) {
    archetypeAssignments.set(goalMachine.id, PLAYER_ARCHETYPES.GOAL_MACHINE)
    assignedPlayers.add(goalMachine.id)
  }

  // 3) Top Scorer: most goals
  const topScorer = pickBest(remaining(), (p) => p.goal)
  if (topScorer) {
    archetypeAssignments.set(topScorer.id, PLAYER_ARCHETYPES.TOP_SCORER)
    assignedPlayers.add(topScorer.id)
  }

  // 4) Veteran: most appearances
  const veteran = pickBest(remaining(), (p) => p.apps)
  if (veteran) {
    archetypeAssignments.set(veteran.id, PLAYER_ARCHETYPES.VETERAN_LEGEND)
    assignedPlayers.add(veteran.id)
  }

  // 5) Playmaker: most assists
  const playmaker = pickBest(remaining(), (p) => p.assists)
  if (playmaker) {
    archetypeAssignments.set(playmaker.id, PLAYER_ARCHETYPES.PLAYMAKER)
    assignedPlayers.add(playmaker.id)
  }

  // 6) Clutch: best efficiency (goals+assists per match)
  const clutch = pickBest(remaining(), (p) => p.gAPm)
  if (clutch) {
    archetypeAssignments.set(clutch.id, PLAYER_ARCHETYPES.CLUTCH_PLAYER)
    assignedPlayers.add(clutch.id)
  }

  // 7) Rising Star: best young player (age < 25) by contributions
  const youngCandidates = remaining().filter((p) => p.age < 25)
  const risingStar = pickBest(youngCandidates, (p) => p.goal + p.assists)
  if (risingStar) {
    archetypeAssignments.set(risingStar.id, PLAYER_ARCHETYPES.RISING_STAR)
    assignedPlayers.add(risingStar.id)
  }

  // 8) Complete Legend: 100+ goals AND 100+ assists (best by contributions)
  const completeCandidates = remaining().filter((p) => p.goal >= 100 && p.assists >= 100)
  const completeLegend = pickBest(completeCandidates, (p) => p.goal + p.assists)
  if (completeLegend) {
    archetypeAssignments.set(completeLegend.id, PLAYER_ARCHETYPES.COMPLETE_LEGEND)
    assignedPlayers.add(completeLegend.id)
  }

  // Fill remaining top-15 slots with Elite Performer
  remaining().forEach((p) => {
    archetypeAssignments.set(p.id, PLAYER_ARCHETYPES.ELITE_PERFORMER)
    assignedPlayers.add(p.id)
  })

  return archetypeAssignments
}

export function getPlayerArchetype(
  player: any,
  goatPlayer?: any,
  assignments?: Map<number, PlayerArchetype>,
): PlayerArchetype {
  if (assignments) {
    return assignments.get(player.id) ?? PLAYER_ARCHETYPES.NONE
  }

  if (goatPlayer && player.id === goatPlayer.id) {
    return PLAYER_ARCHETYPES.GOAT
  }

  return PLAYER_ARCHETYPES.NONE
}
