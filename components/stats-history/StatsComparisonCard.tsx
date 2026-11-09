"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeftRight, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { api, StatsAsOfResult } from "@/lib/api"
import { cn } from "@/lib/utils"

interface StatsComparisonCardProps {
  playerId: number
}

const METRICS: { key: keyof StatsAsOfResult; label: string; decimals: number }[] = [
  { key: "apps", label: "Apps", decimals: 0 },
  { key: "goals", label: "Goals", decimals: 0 },
  { key: "assists", label: "Assists", decimals: 0 },
  { key: "gPm", label: "G/App", decimals: 3 },
  { key: "aPm", label: "A/App", decimals: 3 },
  { key: "gAPm", label: "G+A/App", decimals: 3 },
  { key: "ovr", label: "OVR", decimals: 0 },
]

export function StatsComparisonCard({ playerId }: StatsComparisonCardProps) {
  const [dateA, setDateA] = useState("")
  const [dateB, setDateB] = useState("")
  const [resultA, setResultA] = useState<StatsAsOfResult | null>(null)
  const [resultB, setResultB] = useState<StatsAsOfResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const compare = async () => {
    if (!dateA || !dateB) return
    try {
      setLoading(true)
      setError(null)
      const [a, b] = await Promise.all([
        api.getPlayerStatsAsOf(playerId, dateA),
        api.getPlayerStatsAsOf(playerId, dateB),
      ])
      setResultA(a)
      setResultB(b)
      if (!a.hasData || !b.hasData) {
        setError("No stat data available for one or both dates.")
      }
    } catch {
      setError("Failed to load comparison.")
    } finally {
      setLoading(false)
    }
  }

  const fmt = (v: any, decimals: number) =>
    v === null || v === undefined ? "—" : Number(v).toFixed(decimals)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5" />
          Compare Two Dates
        </CardTitle>
        <CardDescription>
          See how totals and per-app ratios changed between any two dates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Snapshot A</label>
            <input
              type="date"
              value={dateA}
              onChange={(e) => setDateA(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Snapshot B</label>
            <input
              type="date"
              value={dateB}
              onChange={(e) => setDateB(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <Button onClick={compare} disabled={!dateA || !dateB || loading}>
            {loading ? "Comparing..." : "Compare"}
          </Button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {resultA?.hasData && resultB?.hasData && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Metric</th>
                  <th className="py-2 pr-4 font-medium">{new Date(dateA).toLocaleDateString()}</th>
                  <th className="py-2 pr-4 font-medium">{new Date(dateB).toLocaleDateString()}</th>
                  <th className="py-2 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {METRICS.map(({ key, label, decimals }) => {
                  const a = resultA[key] as number | null | undefined
                  const b = resultB[key] as number | null | undefined
                  const delta = a != null && b != null ? b - a : null
                  const pct = delta !== null && a ? (delta / a) * 100 : null
                  return (
                    <tr key={key} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{label}</td>
                      <td className="py-2 pr-4">{fmt(a, decimals)}</td>
                      <td className="py-2 pr-4 font-semibold">{fmt(b, decimals)}</td>
                      <td className="py-2">
                        {delta === null ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span
                            className={cn(
                              "flex items-center gap-1 font-medium",
                              delta > 0 ? "text-green-600" : delta < 0 ? "text-red-600" : "text-muted-foreground"
                            )}
                          >
                            {delta > 0 ? (
                              <TrendingUp className="h-3.5 w-3.5" />
                            ) : delta < 0 ? (
                              <TrendingDown className="h-3.5 w-3.5" />
                            ) : (
                              <Minus className="h-3.5 w-3.5" />
                            )}
                            {delta > 0 ? "+" : ""}
                            {decimals > 0 ? delta.toFixed(decimals) : delta}
                            {pct !== null && decimals === 0 && ` (${pct > 0 ? "+" : ""}${pct.toFixed(1)}%)`}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
