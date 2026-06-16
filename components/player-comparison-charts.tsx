"use client"

import { useMemo } from "react"
import { BarChart, Bar, RadarChart, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type Player } from "@/lib/use-players"
import { calculatePlayerRating } from "@/lib/leaderboard-utils"

interface PlayerComparisonChartsProps {
  player1: Player
  player2: Player
}

export function PlayerComparisonCharts({ player1, player2 }: PlayerComparisonChartsProps) {
  const chartData = useMemo(() => {
    const rating1 = calculatePlayerRating(player1)
    const rating2 = calculatePlayerRating(player2)

    // Normalize stats to 0-100 scale for radar chart
    const maxGoals = 2000
    const maxAssists = 1000
    const maxAge = 45

    return [
      {
        stat: "Rating",
        [player1.name]: Math.round(rating1),
        [player2.name]: Math.round(rating2),
      },
      {
        stat: "Goals",
        [player1.name]: Math.round((player1.goal / maxGoals) * 100),
        [player2.name]: Math.round((player2.goal / maxGoals) * 100),
      },
      {
        stat: "Assists",
        [player1.name]: Math.round((player1.assists / maxAssists) * 100),
        [player2.name]: Math.round((player2.assists / maxAssists) * 100),
      },
      {
        stat: "Age",
        [player1.name]: Math.round((player1.age / maxAge) * 100),
        [player2.name]: Math.round((player2.age / maxAge) * 100),
      },
    ]
  }, [player1, player2])

  const radarData = useMemo(() => {
    const rating1 = calculatePlayerRating(player1)
    const rating2 = calculatePlayerRating(player2)

    const maxGoals = 2000
    const maxAssists = 1000

    return [
      {
        category: "Rating",
        [player1.name]: Math.round(rating1),
        [player2.name]: Math.round(rating2),
      },
      {
        category: "Goals/Game",
        [player1.name]: player1.goal > 0 ? Math.min(Math.round((player1.goal / 50) * 100), 100) : 0,
        [player2.name]: player2.goal > 0 ? Math.min(Math.round((player2.goal / 50) * 100), 100) : 0,
      },
      {
        category: "Assists/Game",
        [player1.name]: player1.assists > 0 ? Math.min(Math.round((player1.assists / 30) * 100), 100) : 0,
        [player2.name]: player2.assists > 0 ? Math.min(Math.round((player2.assists / 30) * 100), 100) : 0,
      },
      {
        category: "Experience",
        [player1.name]: Math.min(Math.round((player1.age / 35) * 100), 100),
        [player2.name]: Math.min(Math.round((player2.age / 35) * 100), 100),
      },
      {
        category: "Peak Potential",
        [player1.name]: player1.goal > player1.assists ? 80 : 60,
        [player2.name]: player2.goal > player2.assists ? 80 : 60,
      },
    ]
  }, [player1, player2])

  const colors = ["#3b82f6", "#ef4444"]

  return (
    <div className="space-y-6">
      {/* Side-by-Side Stat Bars */}
      <Card>
        <CardHeader>
          <CardTitle>Stats Comparison</CardTitle>
          <CardDescription>Side-by-side comparison of key statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stat" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={player1.name} fill={colors[0]} />
              <Bar dataKey={player2.name} fill={colors[1]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Radar</CardTitle>
          <CardDescription>Multi-dimensional performance comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name={player1.name} dataKey={player1.name} stroke={colors[0]} fill={colors[0]} fillOpacity={0.25} />
              <Radar name={player2.name} dataKey={player2.name} stroke={colors[1]} fill={colors[1]} fillOpacity={0.25} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics</CardTitle>
          <CardDescription>Complete statistical breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{player1.name}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="font-medium">{Math.round(calculatePlayerRating(player1))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Goals</span>
                  <span className="font-medium">{player1.goal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assists</span>
                  <span className="font-medium">{player1.assists}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Age</span>
                  <span className="font-medium">{player1.age}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position</span>
                  <span className="font-medium">{player1.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Team</span>
                  <span className="font-medium">{player1.team}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-center">vs</h3>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{player2.name}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="font-medium">{Math.round(calculatePlayerRating(player2))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Goals</span>
                  <span className="font-medium">{player2.goal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assists</span>
                  <span className="font-medium">{player2.assists}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Age</span>
                  <span className="font-medium">{player2.age}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position</span>
                  <span className="font-medium">{player2.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Team</span>
                  <span className="font-medium">{player2.team}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
