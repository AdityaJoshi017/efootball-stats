"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SnapshotComparison } from "@/lib/api"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface ComparisonCardProps {
  comparison: SnapshotComparison
  playerName?: string
}

export function ComparisonCard({ comparison, playerName }: ComparisonCardProps) {
  if (!comparison.hasPreviousSnapshot) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stat Comparison</CardTitle>
          <CardDescription>No previous snapshot available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {comparison.message || "Create a snapshot to start tracking stat changes."}
          </p>
        </CardContent>
      </Card>
    )
  }

  const renderStatRow = (
    label: string,
    current: number,
    previous: number,
    change: number,
    percentChange: number
  ) => {
    const isPositive = change > 0
    const isNegative = change < 0
    const isNeutral = change === 0

    return (
      <div className="flex items-center justify-between py-2 border-b last:border-0">
        <span className="font-medium w-24">{label}</span>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground w-16 text-right">{previous}</span>
          <span className="text-muted-foreground">→</span>
          <span className="font-semibold w-16 text-right">{current}</span>
          <div className="flex items-center gap-1 w-24">
            {isPositive && <TrendingUp className="w-4 h-4 text-green-600" />}
            {isNegative && <TrendingDown className="w-4 h-4 text-red-600" />}
            {isNeutral && <Minus className="w-4 h-4 text-gray-400" />}
            <span className={isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-gray-400"}>
              {change > 0 ? "+" : ""}{change}
            </span>
          </div>
          <span className={`text-sm w-16 text-right ${isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-gray-400"}`}>
            ({percentChange > 0 ? "+" : ""}{percentChange}%)
          </span>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stat Comparison</CardTitle>
        <CardDescription>
          {playerName && `Comparison for ${playerName} • `}
          Last snapshot: {comparison.lastSnapshotDate ? new Date(comparison.lastSnapshotDate).toLocaleDateString() : "N/A"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {renderStatRow(
            "Goals",
            comparison.current.goals,
            comparison.previous?.goals || 0,
            comparison.changes?.goals || 0,
            comparison.percentChanges?.goals || 0
          )}
          {renderStatRow(
            "Assists",
            comparison.current.assists,
            comparison.previous?.assists || 0,
            comparison.changes?.assists || 0,
            comparison.percentChanges?.assists || 0
          )}
          {renderStatRow(
            "Matches",
            comparison.current.apps,
            comparison.previous?.apps || 0,
            comparison.changes?.apps || 0,
            comparison.percentChanges?.apps || 0
          )}
        </div>
      </CardContent>
    </Card>
  )
}
