"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Send, X, Minimize2, Maximize2, HelpCircle, Menu } from "lucide-react"
import { usePlayers, type Player } from "@/lib/use-players"
// import {
//   handleLocalQuery,
//   getPlayerRating,
//   getConsistencyScore,
//   getOverUnderRating,
//   getConfidenceLevel,
// } from "@/lib/statsEngine"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [showQueries, setShowQueries] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { players: playersData } = usePlayers()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const findTopScorer = () => {
    if (!playersData.length) return "No player data available."
    
    const topScorer = playersData.reduce((top, player) => 
      player.goal > top.goal ? player : top
    )
    
    return `The top scorer is ${topScorer.name} with ${topScorer.goal} goals in ${topScorer.apps} appearances (${topScorer.gPm.toFixed(3)} goals per match).`
  }

  const findTopAssistProvider = () => {
    if (!playersData.length) return "No player data available."
    
    const topAssist = playersData.reduce((top, player) => 
      player.assists > top.assists ? player : top
    )
    
    return `The top assist provider is ${topAssist.name} with ${topAssist.assists} assists in ${topAssist.apps} appearances (${topAssist.aPm.toFixed(3)} assists per match).`
  }

  const findMostEfficient = () => {
    if (!playersData.length) return "No player data available."
    
    const mostEfficient = playersData.reduce((top, player) => 
      player.gAPm > top.gAPm ? player : top
    )
    
    return `The most efficient player is ${mostEfficient.name} with ${mostEfficient.gAPm.toFixed(3)} goals + assists per match.`
  }

  const findBestGoalScoringRatio = () => {
    if (!playersData.length) return "No player data available."
    
    const bestRatio = playersData.reduce((top, player) => 
      player.gPm > top.gPm ? player : top
    )
    
    return `The best goal scoring ratio is ${bestRatio.name} with ${bestRatio.gPm.toFixed(3)} goals per match (${bestRatio.goal} goals in ${bestRatio.apps} appearances).`
  }

  const findWorstScorer = () => {
    if (!playersData.length) return "No player data available."
    
    const worstScorer = playersData.filter(p => p.apps > 0).reduce((worst, player) => 
      player.goal < worst.goal ? player : worst
    )
    
    return `The worst scorer is ${worstScorer.name} with only ${worstScorer.goal} goals in ${worstScorer.apps} appearances (${worstScorer.gPm.toFixed(3)} goals per match).`
  }

  const findWorstAssistProvider = () => {
    if (!playersData.length) return "No player data available."
    
    const worstAssist = playersData.filter(p => p.apps > 0).reduce((worst, player) => 
      player.assists < worst.assists ? player : worst
    )
    
    return `The worst assist provider is ${worstAssist.name} with only ${worstAssist.assists} assists in ${worstAssist.apps} appearances (${worstAssist.aPm.toFixed(3)} assists per match).`
  }

  const findWorstEfficient = () => {
    if (!playersData.length) return "No player data available."
    
    const worstEfficient = playersData.filter(p => p.apps > 0).reduce((worst, player) => 
      player.gAPm < worst.gAPm ? player : worst
    )
    
    return `The least efficient player is ${worstEfficient.name} with only ${worstEfficient.gAPm.toFixed(3)} goals + assists per match.`
  }

  const findWorstGoalScoringRatio = () => {
    if (!playersData.length) return "No player data available."
    
    const worstRatio = playersData.filter(p => p.apps > 0).reduce((worst, player) => 
      player.gPm < worst.gPm ? player : worst
    )
    
    return `The worst goal scoring ratio is ${worstRatio.name} with only ${worstRatio.gPm.toFixed(3)} goals per match (${worstRatio.goal} goals in ${worstRatio.apps} appearances).`
  }

  const findWorstScorerByPosition = (position: string) => {
    const posPlayers = playersData.filter(p => p.position.toLowerCase() === position.toLowerCase() && p.apps > 0)
    if (posPlayers.length === 0) return `No players found for position "${position}"`
    
    const worstScorer = posPlayers.reduce((worst, player) => 
      player.goal < worst.goal ? player : worst
    )
    
    return `The worst scorer among ${position.toUpperCase()} players is ${worstScorer.name} with only ${worstScorer.goal} goals in ${worstScorer.apps} appearances (${worstScorer.gPm.toFixed(3)} goals per match).`
  }

  const findWorstAssistByPosition = (position: string) => {
    const posPlayers = playersData.filter(p => p.position.toLowerCase() === position.toLowerCase() && p.apps > 0)
    if (posPlayers.length === 0) return `No players found for position "${position}"`
    
    const worstAssist = posPlayers.reduce((worst, player) => 
      player.assists < worst.assists ? player : worst
    )
    
    return `The worst assist provider among ${position.toUpperCase()} players is ${worstAssist.name} with only ${worstAssist.assists} assists in ${worstAssist.apps} appearances (${worstAssist.aPm.toFixed(3)} assists per match).`
  }

  const findWorstEfficientByPosition = (position: string) => {
    const posPlayers = playersData.filter(p => p.position.toLowerCase() === position.toLowerCase() && p.apps > 0)
    if (posPlayers.length === 0) return `No players found for position "${position}"`
    
    const worstEfficient = posPlayers.reduce((worst, player) => 
      player.gAPm < worst.gAPm ? player : worst
    )
    
    return `The least efficient ${position.toUpperCase()} player is ${worstEfficient.name} with only ${worstEfficient.gAPm.toFixed(3)} goals + assists per match.`
  }

  const getTeamStats = (teamName: string) => {
    const teamPlayers = playersData.filter((p) => p.team.toLowerCase() === teamName.toLowerCase())
    if (teamPlayers.length === 0) return `No players found for team "${teamName}"`
    
    const totalGoals = teamPlayers.reduce((sum, p) => sum + p.goal, 0)
    const totalAssists = teamPlayers.reduce((sum, p) => sum + p.assists, 0)
    const avgAge = Math.round(teamPlayers.reduce((sum, p) => sum + p.age, 0) / teamPlayers.length)
    const topScorer = teamPlayers.reduce((top, player) => player.goal > top.goal ? player : top)
    
    return `${teamName} has ${teamPlayers.length} players with ${totalGoals} total goals and ${totalAssists} total assists. Top scorer: ${topScorer.name} (${topScorer.goal} goals). Average age: ${avgAge} years.`
  }

  const getPositionStats = (position: string) => {
    const posPlayers = playersData.filter((p) => p.position.toLowerCase() === position.toLowerCase())
    if (posPlayers.length === 0) return `No players found for position "${position}"`
    
    const totalGoals = posPlayers.reduce((sum, p) => sum + p.goal, 0)
    const totalAssists = posPlayers.reduce((sum, p) => sum + p.assists, 0)
    const topPlayer = posPlayers.reduce((top, player) => player.goal > top.goal ? player : top)
    
    return `${position.toUpperCase()} position has ${posPlayers.length} players with ${totalGoals} total goals and ${totalAssists} total assists. Best ${position}: ${topPlayer.name} (${topPlayer.goal} goals, ${topPlayer.assists} assists).`
  }

  const getCardTypeStats = (cardType: string) => {
    const cardPlayers = playersData.filter((p) => p.cardType.toLowerCase() === cardType.toLowerCase())
    if (cardPlayers.length === 0) return `No players found with card type "${cardType}"`
    
    const totalGoals = cardPlayers.reduce((sum, p) => sum + p.goal, 0)
    const totalAssists = cardPlayers.reduce((sum, p) => sum + p.assists, 0)
    const topPlayer = cardPlayers.reduce((top, player) => player.goal > top.goal ? player : top)
    
    return `${cardType} cards: ${cardPlayers.length} players with ${totalGoals} total goals and ${totalAssists} total assists. Best ${cardType}: ${topPlayer.name} (${topPlayer.goal} goals).`
  }

  const findPlayerByName = (name: string): Player | null => {
    // Handle accented characters by normalizing both search term and player names
    const normalizedName = name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    
    return playersData.find(player => {
      const normalizedPlayerName = player.name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      
      return normalizedPlayerName.includes(normalizedName) || 
             player.name.toLowerCase().includes(name.toLowerCase())
    }) || null
  }

const getPlayerStats = (name: string) => {
  const player = findPlayerByName(name)
  if (!player) return `I couldn't find a player named "${name}".`

  return `
${player.name} (${player.position}, ${player.team})

Goals: ${player.goal}
Assists: ${player.assists}
Appearances: ${player.apps}

Goals per match: ${player.gPm.toFixed(2)}
Assists per match: ${player.aPm.toFixed(2)}
G+A per match: ${player.gAPm.toFixed(2)}

Rating: ${getPlayerRating(player).toFixed(1)}
Consistency: ${getConsistencyScore(player).toFixed(1)}
Assessment: ${getOverUnderRating(player)}
Confidence: ${getConfidenceLevel(player)}
`.trim()
}


  const predefinedQuestions = [
    {
  category: "Player Rankings",
  questions: [
    "Who is the top scorer?",
    "Who has the most assists?",
    "Who has the best goals per match ratio?",
    "Who has the best assists per match ratio?",
    "Who is the most efficient player?",
    "Who has the most appearances?",
    "Top 5 goal scorers",
    "Top 5 assist providers",
    "Top 5 most efficient players",
    "Rank players by total goals"
  ]
},{
  category: "Player Intelligence",
  questions: [
    "Who has the best card for each player?",
    "Which player performs best relative to their position?",
    "Which players are more creators than scorers?",
    "Which players are pure goal scorers?",
    "Which players are the most balanced attackers?",
    "Who has the biggest gap between goals and assists?"
  ]
},
    {
  category: "Career Analysis",
  questions: [
    "Messi career summary",
    "Ronaldo career summary",
    "Neymar career summary",
    "Mbappé career summary",
    "Who has the best career goals per match?",
    "Who has the best career assists per match?",
    "Who has the most productive career?",
    "Compare Messi and Ronaldo careers"
  ]
},
       {
  category: "Team Analysis",
  questions: [
    "Which team has the most players?",
    "Which team has the most goals?",
    "Which team has the most assists?",
    "Team statistics for Barcelona",
    "Team statistics for Real Madrid",
    "Which team is the best by total goals?",
    "Which team has the best attackers?"
  ]
},
        {
  category: "Position Analysis",
  questions: [
    "CF position statistics",
    "SS position statistics",
    "AMF position statistics",
    "CMF position statistics",
    "LWF position statistics",
    "RWF position statistics",
    "Worst scorer CF",
    "Least efficient AMF",
    "Worst scorer SS",
    "Most reliable CF"
  ]
},
        {
  category: "Card Type Analysis",
  questions: [
    "Which card type has the most goals?",
    "Which card type has the most assists?",
    "Show epic card statistics",
    "Show potw card statistics",
    "Show highlight card statistics",
    "Which card type is most efficient?"
  ]
},
        {
  category: "Player Specific",
  questions: [
    "Messi stats",
    "Ronaldo stats",
    "Neymar stats",
    "Mbappé stats",
    "How many goals does Messi have?",
    "How many assists does Ronaldo have?",
    "Show Mbappé performance"
  ]
},
        {
  category: "Reliability & Consistency",
  questions: [
    "Who is the most consistent player?",
    "Which player has the longest career?",
    "Who has the most appearances?",
    "High impact players with fewer matches",
    "Which players are reliable performers?"
  ]
},
   {
  category: "Player Lookup",
  questions: [
    "Show stats for Messi",
    "Show stats for Ronaldo",
    "Compare Messi and Mbappé",
    "Compare Ronaldo and Neymar",
    "Compare two players"
  ]
},
    {
  category: "Debates & What-Ifs",
  questions: [
    "Is Messi better than Ronaldo?",
    "Who is the most complete attacker?",
    "Who is more of a playmaker than scorer?",
    "Who is underrated based on stats?",
    "Who is overrated based on stats?"
  ]
},
  ]

  const handleQuestionSelect = (question: string) => {
    setInputValue(question)
    setShowMenu(false)
    // Auto-send the question
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }
type Intent = "fact" | "rank" | "compare" | "explain" | "unknown"

const detectIntent = (input: string): Intent => {
  if (input.includes("compare") || input.includes(" vs ")) return "compare"

  if (
    input.match(/\btop\s+\d+/) ||
    input.includes("rank ") ||
    input.includes("ranking")
  ) return "rank"

  if (input.startsWith("why") || input.includes("better")) return "explain"

  return "fact"
}

const POSITION_WEIGHTS: Record<string, {
  goal: number
  assist: number
  efficiency: number
  experience: number
}> = {
  CF:  { goal: 0.45, assist: 0.15, efficiency: 0.30, experience: 0.10 },
  SS:  { goal: 0.35, assist: 0.25, efficiency: 0.30, experience: 0.10 },
  AMF: { goal: 0.20, assist: 0.40, efficiency: 0.30, experience: 0.10 },
  CMF: { goal: 0.15, assist: 0.35, efficiency: 0.30, experience: 0.20 },
  DMF: { goal: 0.10, assist: 0.20, efficiency: 0.30, experience: 0.40 },
  LWF: { goal: 0.30, assist: 0.25, efficiency: 0.30, experience: 0.15 },
  RWF: { goal: 0.30, assist: 0.25, efficiency: 0.30, experience: 0.15 },
}
const getPlayerRating = (player: Player): number => {
  const w = POSITION_WEIGHTS[player.position] ?? POSITION_WEIGHTS.CF

  return (
    player.gPm * 100 * w.goal +
    player.aPm * 100 * w.assist +
    player.gAPm * 100 * w.efficiency +
    Math.min(player.apps / 15, 100) * w.experience
  )
}
const comparePlayersByRating = (p1: Player, p2: Player) => {
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


//  const processMessage = async (userInput: string) => {
//   const input = userInput.toLowerCase().trim()

//   // ===============================
//   // 1️⃣ LOCAL LOGIC FIRST (MAIN BRAIN)
//   // ===============================

//   // Player specific queries - check FIRST
//   const player = findPlayerByName(userInput)
//   if (player) {
//     return getPlayerStats(player.name)
//   }

//   // Player statistics queries
//   if (input.includes("top scorer") || input.includes("most goals") || input.includes("who scored the most")) {
//     return findTopScorer()
//   }

//   if (input.includes("top assist") || input.includes("most assists") || input.includes("who assisted the most")) {
//     return findTopAssistProvider()
//   }

//   if (input.includes("most efficient") || input.includes("best efficiency") || input.includes("most productive")) {
//     return findMostEfficient()
//   }

//   if (input.includes("goal scoring ratio") || input.includes("best ratio") || input.includes("goals per match")) {
//     return findBestGoalScoringRatio()
//   }

//   // ===============================
//   // 2️⃣ POSITION-SPECIFIC WORST QUERIES
//   // ===============================
//   const posMatch = input.match(/\b(cf|ss|amf|cmf|dmf|lwf|rwf|cb|lb|rb|gk)\b/i)
//   const foundPos = posMatch?.[1] ?? null

//   if (foundPos && input.includes("worst scorer")) {
//     return findWorstScorerByPosition(foundPos)
//   }

//   if (foundPos && input.includes("worst assist")) {
//     return findWorstAssistByPosition(foundPos)
//   }

//   if (foundPos && input.includes("least efficient")) {
//     return findWorstEfficientByPosition(foundPos)
//   }

//   // ===============================
//   // 3️⃣ GENERIC WORST QUERIES
//   // ===============================
//   if (input.includes("worst scorer")) return findWorstScorer()
//   if (input.includes("worst assist")) return findWorstAssistProvider()
//   if (input.includes("least efficient")) return findWorstEfficient()
//   if (input.includes("worst ratio")) return findWorstGoalScoringRatio()

//   // ===============================
//   // 4️⃣ TEAM QUERIES
//   // ===============================
//   const teams = [...new Set(playersData.map(p => p.team.toLowerCase()))]
//   const foundTeam = teams.find(team => input.includes(team))

//   if (foundTeam) {
//     return getTeamStats(foundTeam)
//   }

//   if (input.includes("best team")) {
//     const teamGoals: Record<string, number> = {}
//     playersData.forEach(p => {
//       teamGoals[p.team] = (teamGoals[p.team] || 0) + p.goal
//     })

//     const [bestTeam, goals] = Object.entries(teamGoals)
//       .sort((a, b) => b[1] - a[1])[0]

//     return `The best team by total goals is ${bestTeam} with ${goals} goals.`
//   }

//   // ===============================
//   // 5️⃣ CARD TYPE QUERIES
//   // ===============================
//   if (input.includes("card") && input.includes("stats")) {
//     const cardTypes = [...new Set(playersData.map(p => p.cardType.toLowerCase()))]
//     const foundCard = cardTypes.find(card => input.includes(card))
//     if (foundCard) return getCardTypeStats(foundCard)
//   }

//   // ===============================
//   // 6️⃣ AGE & APPEARANCE
//   // ===============================
//   if (input.includes("oldest")) {
//     const p = playersData.reduce((a, b) => a.age > b.age ? a : b)
//     return `${p.name} is the oldest player at ${p.age} years.`
//   }

//   if (input.includes("youngest")) {
//     const p = playersData.reduce((a, b) => a.age < b.age ? a : b)
//     return `${p.name} is the youngest player at ${p.age} years.`
//   }

//   if (input.includes("most appearances")) {
//     const p = playersData.reduce((a, b) => a.apps > b.apps ? a : b)
//     return `${p.name} has the most appearances with ${p.apps} matches.`
//   }

//   // ===============================
//   // 7️⃣ IF NOTHING MATCHES → GEMINI
//   // ===============================
//   try {
//     const response = await fetch('/api/chat/gemini-route', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         messages: [{ role: 'user', content: userInput }]
//       })
//     })

//     const data = await response.json()
//     if (data?.reply) return data.reply

//   } catch (error) {
//     console.error("Gemini failed:", error)
//   }

//   // ===============================
//   // 8️⃣ FINAL SAFE FALLBACK
//   // ===============================
//   return "I can help with player stats, rankings, comparisons, and explanations. Try: 'Top 5 CFs by goals' or 'Compare Messi and Ronaldo'."
// }

const processMessage = async (userInput: string) => {
  const input = userInput.toLowerCase().trim()

  // ===============================
  // 1️⃣ LOCAL LOGIC (SINGLE SOURCE)
  // ===============================
  const localReply = handleLocalQuery(input, userInput)
  if (localReply) {
    return localReply
  }
  if (
    input.includes("goal") ||
    input.includes("assist") ||
    input.includes("rank") ||
    input.includes("top")
  ) {
    return "I couldn’t match this exactly. Try rephrasing like: 'Top 5 CFs by goals' or 'Most assists by AMF'."
  }
  // ===============================
  // 2️⃣ GEMINI (EXPLANATIONS / EDGE)
  // ===============================
  try {
    const response = await fetch('/api/chat/gemini-route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: userInput }]
      })
    })

    const data = await response.json()
    if (data?.reply) return data.reply

  } catch (error) {
    console.error("Gemini failed:", error)
  }

  // ===============================
  // 3️⃣ SAFE FALLBACK
  // ===============================
  return "I can help with player stats, rankings, comparisons, and explanations. Try: 'Top 5 CFs by goals' or 'Compare Messi and Ronaldo'."
}

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
  gk: ["gk", "goalkeeper", "keeper"]
}
const getConsistencyScore = (player: Player): number => {
  // Penalize small sample sizes
  const experienceFactor = Math.min(player.apps / 200, 1)

  // Efficiency is main indicator of consistency
  return player.gAPm * 100 * experienceFactor
}
const getOverUnderRating = (player: Player) => {
  const rating = getPlayerRating(player)
  const consistency = getConsistencyScore(player)

  if (rating > 120 && consistency < 60) return "Overrated"
  if (rating < 90 && consistency > 80) return "Underrated"
  return "Fairly rated"
}
const getConfidenceLevel = (player: Player) => {
  if (player.apps > 700) return "Very high confidence"
  if (player.apps > 300) return "High confidence"
  if (player.apps > 100) return "Medium confidence"
  return "Low confidence (small sample size)"
}

const extractPosition = (input: string): string | null => {
  for (const [pos, synonyms] of Object.entries(POSITION_SYNONYMS)) {
    if (synonyms.some(word => input.includes(word))) {
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
const rankPlayers = (
  metric: keyof Player,
  limit = 5,
  filter?: (p: Player) => boolean
) => {
  return playersData
    .filter(filter ?? (() => true))
    .sort((a, b) => (b[metric] as number) - (a[metric] as number))
    .slice(0, limit)
}

const handleLocalQuery = (input: string, rawInput: string): string | null => {
  const intent = detectIntent(input)

  // ======================
  // FACTUAL QUERIES
  // ======================
  if (intent === "fact") {
    const player = findPlayerByName(rawInput)
    if (player) return getPlayerStats(player.name)

    if (input.includes("top scorer") || input.includes("most goals")) {
      return findTopScorer()
    }

    if (input.includes("most assists")) {
      return findTopAssistProvider()
    }

    if (input.includes("most efficient")) {
      return findMostEfficient()
    }

    if (input.includes("goals per match")) {
      return findBestGoalScoringRatio()
    }
  }

  // ======================
  // RANKING QUERIES
  // ======================
  // ======================
// RANKING QUERIES
// ======================
if (intent === "rank") {
  const position = extractPosition(input)

  // Metric detection
  const metric: keyof Player =
    input.includes("assist") ? "assists" :
    input.includes("efficient") ? "gAPm" :
    "goal"

  const ranked = rankPlayers(
    metric,
    5,
    position
      ? (p) => p.position === position
      : input.includes("attacker")
        ? (p) => POSITION_GROUPS.attacker.includes(p.position)
        : undefined
  )

  if (ranked.length === 0) {
    return `No players found for this ranking.`
  }

  return `Top 5 ${position ?? "players"} by ${metric}:\n${ranked
    .map(
      (p, i) =>
        `${i + 1}. ${p.name} (${metric === "gAPm"
          ? p.gAPm.toFixed(2)
          : p[metric]
        })`
    )
    .join("\n")}`
}

if (input.includes("underrated")) {
  const underrated = playersData
    .filter(p => getOverUnderRating(p) === "Underrated")
    .sort((a, b) => getConsistencyScore(b) - getConsistencyScore(a))
    .slice(0, 3)

  return `Most underrated players:\n${underrated
    .map(p => `• ${p.name} (${p.position})`)
    .join("\n")}`
}

if (input.includes("overrated")) {
  const overrated = playersData
    .filter(p => getOverUnderRating(p) === "Overrated")
    .sort((a, b) => getPlayerRating(b) - getPlayerRating(a))
    .slice(0, 3)

  return `Most overrated players:\n${overrated
    .map(p => `• ${p.name} (${p.position})`)
    .join("\n")}`
}

  // ======================
  // COMPARISON QUERIES
  // ======================
  if (intent === "compare") {
    const names = playersData
      .map(p => p.name)
      .filter(name => input.includes(name.toLowerCase()))

    if (names.length === 2) {
      const p1 = findPlayerByName(names[0])!
      const p2 = findPlayerByName(names[1])!

      return `
${p1.name} vs ${p2.name}
Goals: ${p1.goal} vs ${p2.goal}
Assists: ${p1.assists} vs ${p2.assists}
G+A per match: ${p1.gAPm.toFixed(2)} vs ${p2.gAPm.toFixed(2)}
Appearances: ${p1.apps} vs ${p2.apps}
`.trim()
    }
  }
// ======================
// EXPLANATION / WHY
// ======================
if (intent === "explain") {
  const names = playersData
    .map(p => p.name)
    .filter(name => input.includes(name.toLowerCase()))

  if (names.length === 2) {
    const p1 = findPlayerByName(names[0])!
    const p2 = findPlayerByName(names[1])!

    const result = comparePlayersByRating(p1, p2)

return `
${p1.name} vs ${p2.name}

Rating: ${result.r1} vs ${result.r2}
Winner: ${result.winner.name}

Goals: ${p1.goal} vs ${p2.goal}
Assists: ${p1.assists} vs ${p2.assists}
G+A per match: ${p1.gAPm.toFixed(2)} vs ${p2.gAPm.toFixed(2)}
`.trim()
  }
}

  // ======================
  // NOT HANDLED LOCALLY
  // ======================
  return null
}

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)
    
    // Simulate bot thinking
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const botResponse = await processMessage(inputValue)
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponse,
      sender: "bot",
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, botMessage])
    setIsTyping(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="fixed bottom-24 right-8 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <Button
          size="lg"
          className="rounded-full w-14 h-14  transition-all"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="w-80 h-[375px] shadow-md">
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">eFootball Stats Bot</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto h-[350px] pb-0">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Ask me about player statistics!</p>
                    <p className="text-sm mt-2">Try: "Who is the top scorer?"</p>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 ${message.sender === "user" ? "text-right" : "text-left"}`}
                  >
                    <div
                      className={`inline-block max-w-[80%] p-3 rounded-lg ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="text-left mb-4">
                    <div className="inline-block bg-muted p-3 rounded-lg">
                      <p className="text-sm">Typing...</p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </CardContent>
              
              <CardContent className="pt-4">
                <div className="flex gap-2 relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMenu(!showMenu)}
                    className="px-2"
                    title="Quick questions"
                  >
                    <Menu className="w-4 h-4" />
                  </Button>
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about player stats..."
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleSendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                  
                  {/* Question Menu Dropdown */}
                  {showMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-80 bg-background border rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
                      <div className="p-2">
                        <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Quick Questions</h4>
                        {predefinedQuestions.map((category, catIndex) => (
                          <div key={catIndex} className="mb-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1">{category.category}</p>
                            <div className="space-y-1">
                              {category.questions.map((question, qIndex) => (
                                <button
                                  key={qIndex}
                                  onClick={() => handleQuestionSelect(question)}
                                  className="w-full text-left text-xs px-2 py-1 rounded hover:bg-muted transition-colors"
                                >
                                  {question}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
        </Card>
      )}
    </div>
  )
}
