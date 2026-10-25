"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { StatUpdate } from "@/lib/api"

interface StatProgressChartProps {
  updates: StatUpdate[]
  statType?: "goals" | "assists" | "apps" | "all"
}

export function StatProgressChart({ updates, statType = "all" }: StatProgressChartProps) {
  // Group updates by date and stat type
  const chartData = updates
    .filter((u) => statType === "all" || u.statType === statType)
    .reduce((acc: any[], update) => {
      const date = new Date(update.createdAt).toLocaleDateString()
      const existing = acc.find((item) => item.date === date)

      if (existing) {
        existing[update.statType] = update.newValue
      } else {
        acc.push({
          date,
          goals: update.statType === "goals" ? update.newValue : null,
          assists: update.statType === "assists" ? update.newValue : null,
          apps: update.statType === "apps" ? update.newValue : null,
        })
      }

      return acc
    }, [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No data available for chart
      </div>
    )
  }

  const colors = {
    goals: "#22c55e",
    assists: "#3b82f6",
    apps: "#a855f7",
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        {statType === "all" || statType === "goals" ? (
          <Line
            type="monotone"
            dataKey="goals"
            stroke={colors.goals}
            strokeWidth={2}
            dot={{ r: 4 }}
            connectNulls={false}
          />
        ) : null}
        {statType === "all" || statType === "assists" ? (
          <Line
            type="monotone"
            dataKey="assists"
            stroke={colors.assists}
            strokeWidth={2}
            dot={{ r: 4 }}
            connectNulls={false}
          />
        ) : null}
        {statType === "all" || statType === "apps" ? (
          <Line
            type="monotone"
            dataKey="apps"
            stroke={colors.apps}
            strokeWidth={2}
            dot={{ r: 4 }}
            connectNulls={false}
          />
        ) : null}
      </LineChart>
    </ResponsiveContainer>
  )
}
