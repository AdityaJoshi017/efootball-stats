import type { Player } from "@/lib/use-players"
import { QUESTION_LOOKUP, FactKey } from "./predefined"

/* =========================
   Metric Resolver
========================= */

const metricValue = (p: Player, key: FactKey): number => {
  switch (key) {
    case "top_scorer":
      return p.goal
    case "most_assists":
      return p.assists
    case "best_gpm":
      return p.gPm
    case "best_apm":
      return p.aPm
    case "most_efficient":
      return p.gAPm
    case "most_appearances":
      return p.apps
    case "biggest_goal_assist_gap":
      return Math.abs(p.goal - p.assists)
    default:
      return 0
  }
}

/* =========================
   Auto Fact Resolver
========================= */

const resolveFact = (key: FactKey, players: Player[]): string => {
  if (!players.length) return "No player data available."

  const best = players.reduce((top, p) =>
    metricValue(p, key) > metricValue(top, key) ? p : top
  )

  switch (key) {
    case "top_scorer":
      return `The top scorer is ${best.name} with ${best.goal} goals.`
    case "most_assists":
      return `The most assists were provided by ${best.name} (${best.assists}).`
    case "best_gpm":
      return `${best.name} has the best goals per match ratio (${best.gPm.toFixed(3)}).`
    case "best_apm":
      return `${best.name} has the best assists per match ratio (${best.aPm.toFixed(3)}).`
    case "most_efficient":
      return `${best.name} is the most efficient player (${best.gAPm.toFixed(3)} G+A per match).`
    case "most_appearances":
      return `${best.name} has the most appearances (${best.apps}).`
    case "biggest_goal_assist_gap":
      return `${best.name} has the biggest gap between goals and assists (${Math.abs(
        best.goal - best.assists
      )}).`
    default:
      return "Unhandled predefined question."
  }
}

/* =========================
   Intent Detection
========================= */

const detectIntent = (input: string) => {
  if (input.startsWith("why") || input.includes("better")) return "explain"
  return "fact"
}

/* =========================
   MAIN ENTRY
========================= */

export async function getChatResponse(
  userInput: string,
  players: Player[]
): Promise<string> {
  const normalized = userInput.toLowerCase().trim()
  const intent = detectIntent(normalized)

  // ✅ 100% predefined auto-handlers
  const factKey = QUESTION_LOOKUP[normalized]
  if (factKey) {
    return resolveFact(factKey, players)
  }
// ---------------- COMPARE (LOCAL) ----------------
if (normalized.startsWith("compare ")) {
  const names = players
    .map(p => p.name)
    .filter(name =>
      normalized.includes(name.split(" ")[0].toLowerCase())
    )

  if (names.length === 2) {
    const p1 = players.find(p => p.name === names[0])!
    const p2 = players.find(p => p.name === names[1])!

    return `
${p1.name} vs ${p2.name}

Goals: ${p1.goal} vs ${p2.goal}
Assists: ${p1.assists} vs ${p2.assists}
G+A per match: ${p1.gAPm.toFixed(2)} vs ${p2.gAPm.toFixed(2)}
Appearances: ${p1.apps} vs ${p2.apps}
`.trim()
  }
}

  // 🤖 Gemini ONLY for explanations / debates
  if (intent === "explain") {
    try {
      const res = await fetch("/api/chat/gemini-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userInput }],
        }),
      })

      const data = await res.json()
      if (data?.reply) return data.reply
    } catch (e) {
      console.error("Gemini failed", e)
    }
  }

  // 🛡️ Guaranteed fallback
  return "I can help with player stats, rankings, and explanations."
}
if (process.env.NODE_ENV === "development") {
  Object.values(QUESTION_LOOKUP).forEach(key => {
    if (!key) {
      console.warn("⚠️ Missing handler for predefined question")
    }
  })
}
