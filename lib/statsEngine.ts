// lib/statsEngine.ts
import type { Player } from "@/lib/use-players"

/* =========================
   INTENT DETECTION
========================= */

export type Intent = "fact" | "rank" | "compare" | "explain" | "unknown"

export const detectIntent = (input: string): Intent => {
  if (input.includes("compare") || input.includes(" vs ")) return "compare"
  if (
    input.includes("top") ||
    input.includes("rank") ||
    input.includes("best") ||
    input.includes("highest")
  ) return "rank"
  if (input.startsWith("why") || input.includes("better")) return "explain"
  return "fact"
}

/* =========================
   POSITION NORMALIZATION
========================= */

const POSITION_SYNONYMS: Record<string, string[]> = {
  cf: ["cf", "striker", "center forward"],
  ss: ["ss", "second striker"],
  amf: ["amf", "attacking midfielder", "creator", "playmaker"],
  cmf: ["cmf", "central midfielder"],
  dmf: ["dmf", "defensive midfielder"],
  lwf: ["lwf", "left winger", "winger"],
  rwf: ["rwf", "right winger", "winger"],
  cb: ["cb", "center back", "centre back"],
  lb: ["lb", "left back"],
  rb: ["rb", "right back"],
  gk: ["gk", "goalkeeper", "keeper"],
}

export const extractPosition = (input: string): string | null => {
  for (const [pos, synonyms] of Object.entries(POSITION_SYNONYMS)) {
    if (synonyms.some(s => input.includes(s))) {
      return pos.toUpperCase()
    }
  }
  return null
}

const POSITION_GROUPS: Record<string, string[]> = {
  attacker: ["CF", "SS", "LWF", "RWF"],
  midfielder: ["AMF", "CMF", "DMF"],
  defender: ["CB", "LB", "RB"],
}

/* =========================
   RANKING ENGINE
========================= */

export const rankPlayers = (
  players: Player[],
  metric: keyof Player,
  limit = 5,
  filter?: (p: Player) => boolean
) => {
  return players
    .filter(filter ?? (() => true))
    .sort((a, b) => (b[metric] as number) - (a[metric] as number))
    .slice(0, limit)
}

/* =========================
   POSITION-WEIGHTED RATINGS
========================= */

const POSITION_WEIGHTS: Record<
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

export const getPlayerRating = (player: Player): number => {
  const w = POSITION_WEIGHTS[player.position] ?? POSITION_WEIGHTS.CF

  return (
    player.gPm * 100 * w.goal +
    player.aPm * 100 * w.assist +
    player.gAPm * 100 * w.efficiency +
    Math.min(player.apps / 15, 100) * w.experience
  )
}

/* =========================
   CONSISTENCY & TRUST
========================= */

export const getConsistencyScore = (player: Player): number => {
  const experienceFactor = Math.min(player.apps / 200, 1)
  return player.gAPm * 100 * experienceFactor
}

export const getOverUnderRating = (player: Player) => {
  const rating = getPlayerRating(player)
  const consistency = getConsistencyScore(player)

  if (rating > 120 && consistency < 60) return "Overrated"
  if (rating < 90 && consistency > 80) return "Underrated"
  return "Fairly rated"
}

export const getConfidenceLevel = (player: Player) => {
  if (player.apps > 700) return "Very high confidence"
  if (player.apps > 300) return "High confidence"
  if (player.apps > 100) return "Medium confidence"
  return "Low confidence (small sample size)"
}

/* =========================
   COMPARISONS
========================= */

export const comparePlayersByRating = (p1: Player, p2: Player) => {
  const r1 = getPlayerRating(p1)
  const r2 = getPlayerRating(p2)

  const winner = r1 > r2 ? p1 : p2
  const diff = Math.abs(r1 - r2)

  return {
    winner,
    loser: winner === p1 ? p2 : p1,
    diff: diff.toFixed(1),
    r1: r1.toFixed(1),
    r2: r2.toFixed(1),
  }
}

/* =========================
   MAIN QUERY HANDLER
========================= */

export const handleLocalQuery = (
  input: string,
  rawInput: string,
  playersData: Player[],
  findPlayerByName: (name: string) => Player | null,
  getPlayerStats: (name: string) => string
): string | null => {
  const intent = detectIntent(input)

  /* FACTS */
  if (intent === "fact") {
    const player = findPlayerByName(rawInput)
    if (player) return getPlayerStats(player.name)
  }

  /* RANKINGS */
  if (intent === "rank") {
    const position = extractPosition(input)
    const metric: keyof Player =
      input.includes("assist") ? "assists" :
      input.includes("efficient") ? "gAPm" :
      "goal"

    const ranked = rankPlayers(
      playersData,
      metric,
      5,
      position
        ? p => p.position === position
        : input.includes("attacker")
          ? p => POSITION_GROUPS.attacker.includes(p.position)
          : undefined
    )

    if (!ranked.length) return "No players found."

    return `Top 5 ${position ?? "players"} by ${metric}:\n${ranked
      .map((p, i) => `${i + 1}. ${p.name} (${metric === "gAPm" ? p.gAPm.toFixed(2) : p[metric]})`)
      .join("\n")}`
  }

  return null
}
