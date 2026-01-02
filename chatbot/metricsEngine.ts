import type { Player } from "@/lib/use-players"

export const POSITION_WEIGHTS: Record<
  string,
  { goal: number; assist: number; efficiency: number; experience: number }
> = {
  CF:  { goal: 0.45, assist: 0.15, efficiency: 0.30, experience: 0.10 },
  SS:  { goal: 0.35, assist: 0.25, efficiency: 0.30, experience: 0.10 },
  AMF: { goal: 0.20, assist: 0.40, efficiency: 0.30, experience: 0.10 },
  CMF: { goal: 0.15, assist: 0.35, efficiency: 0.30, experience: 0.20 },
  DMF: { goal: 0.10, assist: 0.20, efficiency: 0.30, experience: 0.40 },
  LWF: { goal: 0.30, assist: 0.25, efficiency: 0.30, experience: 0.15 },
  RWF: { goal: 0.30, assist: 0.25, efficiency: 0.30, experience: 0.15 },
}

export const getPlayerRating = (p: Player): number => {
  const w = POSITION_WEIGHTS[p.position] ?? POSITION_WEIGHTS.CF
  return (
    p.gPm * 100 * w.goal +
    p.aPm * 100 * w.assist +
    p.gAPm * 100 * w.efficiency +
    Math.min(p.apps / 15, 100) * w.experience
  )
}

export const getConsistencyScore = (p: Player) =>
  p.gAPm * 100 * Math.min(p.apps / 200, 1)

export const getOverUnderRating = (p: Player) => {
  const rating = getPlayerRating(p)
  const consistency = getConsistencyScore(p)

  if (rating > 120 && consistency < 60) return "Overrated"
  if (rating < 90 && consistency > 80) return "Underrated"
  return "Fairly rated"
}

export const getConfidenceLevel = (p: Player) => {
  if (p.apps > 700) return "Very high confidence"
  if (p.apps > 300) return "High confidence"
  if (p.apps > 100) return "Medium confidence"
  return "Low confidence"
}
