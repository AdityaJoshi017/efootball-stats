
import { GoogleGenerativeAI } from '@google/generative-ai'
import { playersData } from '@/lib/players-data'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

//  */
// function createPlayerContext() {
//   const topPlayers = playersData
//     .slice()
//     .sort((a, b) => b.goal - a.goal)
//     .slice(0, 20)
//     .map(
//       p =>
//         `${p.name} (${p.position}, ${p.team}, ${p.cardType}): ` +
//         `${p.goal} goals, ${p.assists} assists, ` +
//         `${p.gPm.toFixed(3)} G/M, ${p.aPm.toFixed(3)} A/M, ` +
//         `${p.gAPm.toFixed(3)} G+A/M, ${p.apps} apps`
//     )
//     .join('\n')

//   return `
// You are an expert eFootball statistics and analytics assistant.

// ====================
// CRITICAL RULES
// ====================
// 1. Each row represents a PLAYER CARD, not a unique real-world player.
// 2. Player names may repeat across different cards.
// 3. If multiple cards exist and none is specified:
//    → Use the BEST CARD (highest gAPm).
// 4. Career-level questions aggregate ALL cards.
// 5. NEVER invent statistics.
// 6. If data is missing, respond exactly:
//    "Data not available in current dataset."

// ====================
// ANALYTICS DEFINITIONS
// ====================
// - Goals per match = gPm
// - Assists per match = aPm
// - Efficiency = gAPm
// - Reliability increases with apps
// - Position matters
// - EIS = qualitative explanation only (no fake formulas)

// ====================
// AVAILABLE DATA
// ====================
// goal, assists, apps, gPm, aPm, gAPm, position, team, age, cardType

// ====================
// TOP 20 CARDS BY GOALS
// ====================
// ${topPlayers}

// ====================
// RESPONSE STYLE
// ====================
// - Always include numbers
// - Be concise & analytical
// - Explain WHY, not just WHO
// `
// }

// /**
//  * MAIN GEMINI ENTRY
//  * Called by route.ts
//  */
// export async function askGemini(
//   messages: { role: string; content: string }[]
// ): Promise<string> {
//   if (!process.env.GEMINI_API_KEY) {
//     return 'Gemini API key not configured.'
//   }

//   const model = genAI.getGenerativeModel({
//     model: 'gemini-pro',
//     generationConfig: {
//       temperature: 0.3,
//       maxOutputTokens: 500,
//       topP: 0.9,
//     },
//   })

//   const systemMessage = createPlayerContext()
//   const userMessage = messages.at(-1)?.content ?? ''

//   const prompt = `${systemMessage}\n\nUSER QUERY:\n${userMessage}`

//   const result = await model.generateContent(prompt)
//   return result.response?.text() || 'No response from Gemini.'
// }

/**
 * Builds system context for Gemini
 */
function createPlayerContext() {
  const topPlayers = playersData
    .slice()
    .sort((a, b) => b.goal - a.goal)
    .slice(0, 20)
    .map(
      p =>
        `${p.name} (${p.position}, ${p.team}, ${p.cardType}): ` +
        `${p.goal} goals, ${p.assists} assists, ` +
        `${p.gPm.toFixed(3)} G/M, ${p.aPm.toFixed(3)} A/M, ` +
        `${p.gAPm.toFixed(3)} G+A/M, ${p.apps} apps`
    )
    .join('\n')

  return `
You are an expert eFootball statistics and analytics assistant.

RULES:
- Each row = PLAYER CARD
- Multiple cards per player possible
- Default to BEST CARD (highest gAPm)
- Never invent stats

AVAILABLE DATA:
goal, assists, apps, gPm, aPm, gAPm, position, team, age, cardType

TOP 20 CARDS BY GOALS:
${topPlayers}

Always include numbers. Explain WHY.
`
}

/**
 * 👇 THIS is what route.ts will call
 */
export async function askGemini(
  messages: ChatMessage[]
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return 'Gemini API key not configured.'
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-pro',
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 500,
      topP: 0.9,
    },
  })

  const userMessage = messages.at(-1)?.content ?? ''
  const prompt = `${createPlayerContext()}\n\nUSER QUERY:\n${userMessage}`

  const result = await model.generateContent(prompt)
  return result.response?.text() || 'No response from Gemini.'
}
