export type FactKey =
  | "top_scorer"
  | "most_assists"
  | "best_gpm"
  | "best_apm"
  | "most_efficient"
  | "most_appearances"
  | "biggest_goal_assist_gap"

export const predefinedQuestions = [
  {
    category: "Player Rankings",
    questions: [
      { text: "Who is the top scorer?", key: "top_scorer" },
      { text: "Who has the most assists?", key: "most_assists" },
      { text: "Who has the best goals per match ratio?", key: "best_gpm" },
      { text: "Who has the best assists per match ratio?", key: "best_apm" },
      { text: "Who is the most efficient player?", key: "most_efficient" },
      { text: "Who has the most appearances?", key: "most_appearances" },
    ],
  },
  {
    category: "Player Intelligence",
    questions: [
      {
        text: "Who has the biggest gap between goals and assists?",
        key: "biggest_goal_assist_gap",
      },
    ],
  },
] as const

export type PredefinedQuestion =
  typeof predefinedQuestions[number]["questions"][number]

export const QUESTION_LOOKUP: Record<string, FactKey> = Object.fromEntries(
  predefinedQuestions.flatMap(cat =>
    cat.questions.map(q => [q.text.toLowerCase(), q.key])
  )
)
