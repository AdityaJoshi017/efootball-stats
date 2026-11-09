"use client"

import { useMemo, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  ReferenceLine,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Flame, Snowflake } from "lucide-react"
import { StatsHistoryPoint } from "@/lib/api"
import { cn } from "@/lib/utils"

interface StatsHistoryChartProps {
  points: StatsHistoryPoint[]
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })

const totalColors = {
  goals: "#22c55e",
  assists: "#3b82f6",
  apps: "#a855f7",
}

const ratioColors = {
  gPm: "#22c55e",
  aPm: "#3b82f6",
  gAPm: "#f59e0b",
}

const tooltipLabel = (label: any, payload: any) => {
  const point = payload?.[0]?.payload
  return point ? `${label} — ${new Date(point.date).toLocaleDateString()}` : label
}

export function StatsHistoryChart({ points }: StatsHistoryChartProps) {
  const [windowSize, setWindowSize] = useState(5)

  const sorted = useMemo(
    () => [...points].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [points]
  )

  const totalsData = useMemo(
    () =>
      sorted.map((p) => ({
        ...p,
        dateLabel: formatDate(p.date),
        gPm: Number(p.gPm.toFixed(3)),
        aPm: Number(p.aPm.toFixed(3)),
        gAPm: Number(p.gAPm.toFixed(3)),
      })),
    [sorted]
  )

  // Rolling form: per-interval G+A gained (bars) and rolling avg G+A/App (line)
  const formData = useMemo(() => {
    const intervals = sorted.slice(1).map((p, i) => {
      const prev = sorted[i]
      const dApps = p.apps - prev.apps
      const dGA = p.gPlusA - prev.gPlusA
      return {
        date: p.date,
        dateLabel: formatDate(p.date),
        deltaGA: dGA,
        intervalRate: dApps > 0 ? dGA / dApps : null,
      }
    })

    // Rolling average of interval rates over the last `windowSize` intervals with apps > 0
    const rates = intervals.map((iv) => iv.intervalRate)
    return intervals.map((iv, i) => {
      const window = rates.slice(Math.max(0, i - windowSize + 1), i + 1).filter((r): r is number => r !== null)
      const rolling = window.length > 0 ? window.reduce((a, b) => a + b, 0) / window.length : null
      return { ...iv, rollingRate: rolling === null ? null : Number(rolling.toFixed(3)) }
    })
  }, [sorted, windowSize])

  const careerAvg = sorted.length > 0 ? sorted[sorted.length - 1].gAPm : 0
  const latestRolling = [...formData].reverse().find((d) => d.rollingRate !== null)?.rollingRate ?? null
  const isHot = latestRolling !== null && careerAvg > 0 && latestRolling > careerAvg

  const hasOvr = sorted.some((p) => p.ovr != null)
  const ovrData = useMemo(
    () =>
      sorted
        .filter((p) => p.ovr != null)
        .map((p) => ({ date: p.date, dateLabel: formatDate(p.date), ovr: p.ovr as number })),
    [sorted]
  )

  if (totalsData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No stat history recorded yet
      </div>
    )
  }

  return (
    <Tabs defaultValue="totals" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="totals">Totals</TabsTrigger>
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="ratios">Ratios</TabsTrigger>
          {hasOvr && <TabsTrigger value="ovr">OVR</TabsTrigger>}
        </TabsList>
      </div>

      <TabsContent value="totals">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={totalsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dateLabel" />
            <YAxis allowDecimals={false} />
            <Tooltip labelFormatter={tooltipLabel} />
            <Legend />
            <Line type="monotone" dataKey="goals" name="Goals" stroke={totalColors.goals} strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="assists" name="Assists" stroke={totalColors.assists} strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="apps" name="Apps" stroke={totalColors.apps} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="form" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Rolling window:</span>
            {[5, 10, 20].map((w) => (
              <Button
                key={w}
                variant={windowSize === w ? "default" : "outline"}
                size="sm"
                className="h-7 px-2"
                onClick={() => setWindowSize(w)}
              >
                {w}
              </Button>
            ))}
          </div>
          {latestRolling !== null && careerAvg > 0 && (
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
                isHot ? "bg-orange-100 text-orange-700" : "bg-sky-100 text-sky-700"
              )}
            >
              {isHot ? <Flame className="h-3.5 w-3.5" /> : <Snowflake className="h-3.5 w-3.5" />}
              {isHot ? "In Form" : "Cold Streak"} — {latestRolling.toFixed(2)} vs career {careerAvg.toFixed(2)} G+A/App
            </span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={formData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dateLabel" />
            <YAxis yAxisId="left" allowDecimals={false} />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              labelFormatter={tooltipLabel}
              formatter={(value: number, name: string) => [value, name]}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="deltaGA" name="G+A gained" fill="#22c55e" opacity={0.5} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="rollingRate"
              name={`Rolling ${windowSize} avg G+A/App`}
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
            <ReferenceLine
              yAxisId="right"
              y={Number(careerAvg.toFixed(3))}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{ value: "Career avg", position: "insideTopRight", fontSize: 11 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="ratios">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={totalsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dateLabel" />
            <YAxis />
            <Tooltip
              labelFormatter={tooltipLabel}
              formatter={(value: number, name: string) => [value.toFixed(3), name]}
            />
            <Legend />
            <Line type="monotone" dataKey="gPm" name="G/App" stroke={ratioColors.gPm} strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="aPm" name="A/App" stroke={ratioColors.aPm} strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="gAPm" name="G+A/App" stroke={ratioColors.gAPm} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </TabsContent>

      {hasOvr && (
        <TabsContent value="ovr">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ovrData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dateLabel" />
              <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
              <Tooltip labelFormatter={tooltipLabel} />
              <Legend />
              <Line
                type="monotone"
                dataKey="ovr"
                name="OVR"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>
      )}
    </Tabs>
  )
}
