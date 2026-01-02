
// import { type NextRequest, NextResponse } from 'next/server'
// import type { ChatMessage } from './gemini-route'

// // /**
// //  * Create system context for Gemini
// //  * IMPORTANT:
// //  * - Does NOT mutate playersData
// //  * - Explains card vs player logic
// //  * - Aligns with analytics.ts philosophy
// //  */
// // function createPlayerContext() {
// //   const topPlayers = playersData
// //     .slice()
// //     .sort((a, b) => b.goal - a.goal)
// //     .slice(0, 20)
// //     .map(
// //       p =>
// //         `${p.name} (${p.position}, ${p.team}, ${p.cardType}) → ` +
// //         `${p.goal} goals, ${p.assists} assists, ` +
// //         `${p.gPm.toFixed(3)} G/M, ${p.aPm.toFixed(3)} A/M, ` +
// //         `${p.gAPm.toFixed(3)} G+A/M, ${p.apps} apps`
// //     )
// //     .join('\n')

// //   return `
// // You are an expert eFootball statistics and analytics assistant.

// // ====================
// // CRITICAL RULES
// // ====================
// // 1. Each row represents a PLAYER CARD, not a unique real-world player.
// // 2. The same player name may appear multiple times with different cards.
// // 3. If a player has multiple cards and the user does NOT specify one:
// //    → Use the BEST CARD (highest goals + assists per match, gAPm).
// // 4. Career-level questions aggregate ALL cards of that player.
// // 5. NEVER invent or assume statistics.
// // 6. If required data is missing, respond exactly with:
// //    "Data not available in current dataset."

// // ====================
// // ANALYTICS DEFINITIONS
// // ====================
// // - Goals per match = gPm
// // - Assists per match = aPm
// // - Efficiency = goals + assists per match (gAPm)
// // - Reliability increases with appearances (apps)
// // - Position matters when evaluating performance
// // - EFootball Impact Score (EIS):
// //   → A position-aware, reliability-weighted impact metric
// //   → Explain qualitatively if asked (do NOT fabricate a formula)

// // ====================
// // AVAILABLE DATA FIELDS
// // ====================
// // - Goals (goal)
// // - Assists (assists)
// // - Appearances (apps)
// // - Goals per match (gPm)
// // - Assists per match (aPm)
// // - Goals + assists per match (gAPm)
// // - Position (position)
// // - Team (team)
// // - Age (age)
// // - Card type (cardType)

// // ====================
// // TOP 20 CARDS BY TOTAL GOALS
// // ====================
// // ${topPlayers}

// // ====================
// // YOU CAN ANSWER
// // ====================
// // - Player rankings
// // - Player comparisons
// // - Position-based analysis
// // - Team summaries
// // - Card-type analysis
// // - Career summaries
// // - Reliability & consistency questions
// // - Debate-style questions (data-backed)

// // ====================
// // RESPONSE STYLE
// // ====================
// // - Always include numbers when possible
// // - Be concise and analytical
// // - Explain WHY, not just WHO
// // `
// // }

// // export async function POST(request: NextRequest) {
// //   try {
// //     const { messages } = await request.json()

// //     if (!Array.isArray(messages)) {
// //       return NextResponse.json(
// //         { error: 'Invalid messages format' },
// //         { status: 400 }
// //       )
// //     }

// //     if (!process.env.GEMINI_API_KEY) {
// //       return NextResponse.json({
// //         reply:
// //           'Gemini API key not configured. Please add GEMINI_API_KEY to environment variables.',
// //       })
// //     }

// //     const model = genAI.getGenerativeModel({
// //       model: 'gemini-pro',
// //       generationConfig: {
// //         temperature: 0.3,       // analytical, not creative
// //         maxOutputTokens: 500,
// //         topP: 0.9,
// //       },
// //     })

// //     const systemMessage = createPlayerContext()
// //     const userMessage = messages.at(-1)?.content ?? ''

// //     const prompt = `${systemMessage}\n\nUSER QUERY:\n${userMessage}`

// //     const result = await model.generateContent(prompt)
// //     const reply = result.response?.text()

// //     if (!reply) {
// //       return NextResponse.json(
// //         { error: 'No response from Gemini' },
// //         { status: 500 }
// //       )
// //     }

// //     return NextResponse.json({ reply })
// //   } catch (error) {
// //     console.error('Gemini Chat API Error:', error)

// //     return NextResponse.json({
// //       reply:
// //         "I'm temporarily unable to analyze advanced queries. Try asking something like 'Who has the best assists per match?'",
// //     })
// //   }
// // }

// import { askGemini } from './gemini-route'

// export async function POST(request: NextRequest) {
//   try {
//     const { messages } = await request.json()

//     if (!Array.isArray(messages) || !messages.every(m => 
//       m && 
//       typeof m === 'object' && 
//       ['user', 'assistant', 'system'].includes(m.role) &&
//       typeof m.content === 'string'
//     )) {
//       return NextResponse.json(
//         { error: 'Invalid messages format' },
//         { status: 400 }
//       )
//     }

//     const reply = await askGemini(messages)

//     return NextResponse.json({ reply })
//   } catch (error) {
//     console.error('Chat API Error:', error)

//     return NextResponse.json({
//       reply:
//         "I'm temporarily unable to analyze advanced queries. Try asking something like 'Who has the best assists per match?'",
//     })
//   }
// }
import { NextRequest, NextResponse } from 'next/server'
import { askGemini } from './gemini-route'

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (
      !Array.isArray(messages) ||
      !messages.every(
        m =>
          m &&
          typeof m === 'object' &&
          ['user', 'assistant', 'system'].includes(m.role) &&
          typeof m.content === 'string'
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    const reply = await askGemini(messages)

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat API Error:', error)

    return NextResponse.json({
      reply:
        "I'm temporarily unable to analyze advanced queries. Try asking something like 'Who has the best assists per match?'",
    })
  }
}
