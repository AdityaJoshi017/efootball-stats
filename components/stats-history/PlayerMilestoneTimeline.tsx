"use client"

import { Trophy, Target, Users, Zap } from "lucide-react"
import { StatsHistoryPoint } from "@/lib/api"
import { cn } from "@/lib/utils"

interface Milestone {
  label: string
  stat: "goals" | "assists" | "apps" | "gPlusA"
  threshold: number
  date: string
  reachedIn: number // stat value at the time (for "reached in X apps" context use apps)
}

const MILESTONES: { stat: Milestone["stat"]; thresholds: number[] }[] = [
  { stat: "apps", thresholds: [10, 25, 50, 100, 200, 500] },
  { stat: "goals", thresholds: [5, 10, 25, 50, 100] },
  { stat: "assists", thresholds: [5, 10, 25, 50, 100] },
  { stat: "gPlusA", thresholds: [10, 25, 50, 100, 200] },
]

const STAT_LABEL: Record<Milestone["stat"], string> = {
  goals: "Goals",
  assists: "Assists",
  apps: "Apps",
  gPlusA: "G+A",
}

const statIcon = (stat: Milestone["stat"]) => {
  switch (stat) {
    case "goals":
      return <Target className="h-4 w-4 text-green-600" />
    case "assists":
      return <Zap className="h-4 w-4 text-blue-600" />
    case "apps":
      return <Users className="h-4 w-4 text-purple-600" />
    default:
      return <Trophy className="h-4 w-4 text-amber-600" />
  }
}

export function PlayerMilestoneTimeline({ points }: { points: StatsHistoryPoint[] }) {
  const sorted = [...points].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const milestones: Milestone[] = []

  for (const { stat, thresholds } of MILESTONES) {
    for (const threshold of thresholds) {
      const hit = sorted.find((p) => p[stat] >= threshold)
      if (hit) {
        milestones.push({
          label: `${threshold} ${STAT_LABEL[stat]}`,
          stat,
          threshold,
          date: hit.date,
          reachedIn: hit.apps,
        })
      }
    }
  }

  milestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (milestones.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        No milestones reached yet — history starts once stat updates are recorded.
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
      <div className="space-y-4">
        {milestones.map((m, i) => (
          <div key={`${m.stat}-${m.threshold}`} className="relative flex items-start gap-3 pl-0">
            <div
              className={cn(
                "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background",
                i === milestones.length - 1 && "ring-2 ring-amber-400"
              )}
            >
              {statIcon(m.stat)}
            </div>
            <div className="flex-1 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{m.label}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(m.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Reached in {m.reachedIn} appearance{m.reachedIn === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
