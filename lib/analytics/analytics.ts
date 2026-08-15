import { Player, playersData } from "@/lib/players-data"
import { Player as APIPlayer } from "@/lib/use-players"

/* =====================================================
   TYPES
===================================================== */

export type PlayerCard = Player | APIPlayer

export interface CareerSummary {
  name: string
  totalApps: number
  totalGoals: number
  totalAssists: number
  gPm: number
  aPm: number
  gAPm: number
  cardsCount: number
}

/* =====================================================
   GROUPING LOGIC
===================================================== */

export const playersGroupedByName: Record<string, PlayerCard[]> =
  playersData.reduce((acc, player) => {
    const key = player.name.toLowerCase()
    if (!acc[key]) acc[key] = []
    acc[key].push(player)
    return acc
  }, {} as Record<string, PlayerCard[]>)

/* =====================================================
   CARD SELECTION LOGIC
===================================================== */

export function getBestCard(cards: PlayerCard[]): PlayerCard {
  return cards.reduce((best, current) => {
    const currentGAPm = 'stats' in current ? current.stats?.gAPm || 0 : current.gAPm
    const bestGAPm = 'stats' in best ? best.stats?.gAPm || 0 : best.gAPm
    if (currentGAPm > bestGAPm) return current
    if (currentGAPm === bestGAPm && current.apps > best.apps) return current
    return best
  })
}

/* =====================================================
   CAREER SUMMARY
===================================================== */

export function getCareerSummary(cards: PlayerCard[]): CareerSummary {
  const totalApps = cards.reduce((s, c) => s + c.apps, 0)
  const totalGoals = cards.reduce((s, c) => s + c.goal, 0)
  const totalAssists = cards.reduce((s, c) => s + c.assists, 0)

  return {
    name: cards[0].name,
    totalApps,
    totalGoals,
    totalAssists,
    gPm: totalApps > 0 ? totalGoals / totalApps : 0,
    aPm: totalApps > 0 ? totalAssists / totalApps : 0,
    gAPm: totalApps > 0 ? (totalGoals + totalAssists) / totalApps : 0,
    cardsCount: cards.length,
  }
}

/* =====================================================
   POSITION WEIGHTS
===================================================== */

export const positionWeights: Record<
  string,
  { goal: number; assist: number }
> = {
  CF: { goal: 0.7, assist: 0.3 },
  SS: { goal: 0.6, assist: 0.4 },
  AMF: { goal: 0.45, assist: 0.55 },
  CMF: { goal: 0.35, assist: 0.65 },
  LWF: { goal: 0.55, assist: 0.45 },
  RWF: { goal: 0.55, assist: 0.45 },
  LMF: { goal: 0.4, assist: 0.6 },
  RMF: { goal: 0.4, assist: 0.6 },
  LB: { goal: 0.25, assist: 0.75 },
}

/* =====================================================
   RELIABILITY FACTOR
===================================================== */

export function reliabilityFactor(apps: number) {
  return Math.min(1, Math.sqrt(apps / 500))
}

/* =====================================================
   FINAL SCORING
===================================================== */

export function calculateEIS(player: PlayerCard) {
  const weights = positionWeights[player.position]
  if (!weights) return null

  const gPm = 'stats' in player ? player.stats?.gPm || 0 : player.gPm
  const aPm = 'stats' in player ? player.stats?.aPm || 0 : player.aPm

  const baseImpact =
    gPm * weights.goal +
    aPm * weights.assist

  const reliability = reliabilityFactor(player.apps)

  return {
    ...player,
    EIS: baseImpact * reliability * 100,
  }
}

/* =====================================================
   INTERPRETATION RULES (FOR UI / AI)
===================================================== */

export const analyticsRules = `
ANALYTICS RULES:
1. Each row represents a card, not a real-world player
2. Players may have multiple cards
3. Default comparison uses BEST CARD (highest gAPm)
4. Career summaries aggregate all cards
5. Scoring is position-aware and reliability-weighted
`
