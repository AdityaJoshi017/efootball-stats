"use client"

import { useMemo } from "react"
import { StatsHistoryPoint } from "@/lib/api"
import { cn } from "@/lib/utils"

interface DayActivity {
  date: string // YYYY-MM-DD
  gaGained: number
  goals: number
  assists: number
  apps: number
}

const WEEKS = 18

function toKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function ActivityHeatmap({ points }: { points: StatsHistoryPoint[] }) {
  const { grid, monthLabels } = useMemo(() => {
    const sorted = [...points].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Aggregate G+A gained per day from consecutive snapshot deltas
    const byDay = new Map<string, DayActivity>()
    for (let i = 0; i < sorted.length; i++) {
      const p = sorted[i]
      const prev = i > 0 ? sorted[i - 1] : null
      const dGA = prev ? Math.max(0, p.gPlusA - prev.gPlusA) : p.gPlusA
      const dG = prev ? Math.max(0, p.goals - prev.goals) : p.goals
      const dA = prev ? Math.max(0, p.assists - prev.assists) : p.assists
      const dApps = prev ? Math.max(0, p.apps - prev.apps) : p.apps
      const key = toKey(new Date(p.date))
      const existing = byDay.get(key)
      if (existing) {
        existing.gaGained += dGA
        existing.goals += dG
        existing.assists += dA
        existing.apps += dApps
      } else {
        byDay.set(key, { date: key, gaGained: dGA, goals: dG, assists: dA, apps: dApps })
      }
    }

    // Build week columns (Sunday-start) covering the last WEEKS weeks up to today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(today)
    start.setDate(start.getDate() - (WEEKS * 7 - 1))
    start.setDate(start.getDate() - start.getDay()) // back to Sunday

    const columns: (DayActivity | null)[][] = []
    const cursor = new Date(start)
    while (cursor <= today) {
      const week: (DayActivity | null)[] = []
      for (let d = 0; d < 7; d++) {
        const key = toKey(cursor)
        week.push(cursor <= today ? byDay.get(key) ?? { date: key, gaGained: 0, goals: 0, assists: 0, apps: 0 } : null)
        cursor.setDate(cursor.getDate() + 1)
      }
      columns.push(week)
    }

    // Month labels for the first week of each month
    const monthLabels: { index: number; label: string }[] = []
    columns.forEach((week, i) => {
      const first = week.find(Boolean)
      if (first) {
        const month = new Date(first.date).getMonth()
        const prevMonth = i > 0 ? new Date(columns[i - 1].find(Boolean)!.date).getMonth() : -1
        if (month !== prevMonth) {
          monthLabels.push({ index: i, label: new Date(first.date).toLocaleDateString("en-US", { month: "short" }) })
        }
      }
    })

    return { grid: columns, monthLabels }
  }, [points])

  const colorFor = (ga: number) => {
    if (ga === 0) return "bg-muted"
    if (ga <= 2) return "bg-emerald-200"
    if (ga <= 5) return "bg-emerald-400"
    return "bg-emerald-600"
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        {/* Month labels */}
        <div className="relative mb-1 h-4" style={{ marginLeft: "2rem" }}>
          {monthLabels.map((m) => (
            <span
              key={m.index}
              className="absolute text-[10px] text-muted-foreground"
              style={{ left: `${m.index * 14}px` }}
            >
              {m.label}
            </span>
          ))}
        </div>
        <div className="flex">
          {/* Day labels */}
          <div className="mr-1 flex flex-col text-[10px] text-muted-foreground">
            {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
              <div key={i} className="h-3 leading-3">{d}</div>
            ))}
          </div>
          <div className="flex gap-[2px]">
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {week.map((day, di) =>
                  day === null ? (
                    <div key={di} className="h-3 w-3" />
                  ) : (
                    <div
                      key={di}
                      title={
                        day.gaGained > 0
                          ? `${day.date}: +${day.goals} goals, +${day.assists} assists (${day.apps} apps)`
                          : `${day.date}: no recorded activity`
                      }
                      className={cn("h-3 w-3 rounded-[2px]", colorFor(day.gaGained))}
                    />
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
        <span>Less</span>
        <div className="h-3 w-3 rounded-[2px] bg-muted" />
        <div className="h-3 w-3 rounded-[2px] bg-emerald-200" />
        <div className="h-3 w-3 rounded-[2px] bg-emerald-400" />
        <div className="h-3 w-3 rounded-[2px] bg-emerald-600" />
        <span>More G+A</span>
      </div>
    </div>
  )
}
