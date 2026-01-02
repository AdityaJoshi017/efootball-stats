"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Trophy,
  Target,
  Zap,
  Users,
  Medal,
  Crown,
  Award,
  TrendingUp,
  TrendingDown,
  Download,
  ZapIcon,
} from "lucide-react"
import { usePlayers, type Player } from "@/lib/use-players"
import {
  calculateConsistencyRating,
  calculatePlayerRating,
  getStatTrend,
  findBestCombinations,
  getHeadToHead,
  exportRankingsAsCSV,
  downloadCSV,
} from "@/lib/leaderboard-utils"

export default function LeaderboardsPage() {
  const { players: playersData } = usePlayers()
  const [positionFilter, setPositionFilter] = useState<string>("all")
  const [cardTypeFilter, setCardTypeFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [ageFilter, setAgeFilter] = useState<string>("all")
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "goals"

  const filterPlayers = (players: Player[]) => {
    return players.filter((player) => {
      const positionMatch = positionFilter === "all" || player.position === positionFilter
      const cardTypeMatch = cardTypeFilter === "all" || player.cardType === cardTypeFilter
      const searchMatch =
        searchQuery === "" ||
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.team.toLowerCase().includes(searchQuery.toLowerCase())

      let ageMatch = true
      if (ageFilter === "young") ageMatch = player.age <= 25
      if (ageFilter === "prime") ageMatch = player.age > 25 && player.age <= 32
      if (ageFilter === "veteran") ageMatch = player.age > 32

      return positionMatch && cardTypeMatch && searchMatch && ageMatch
    })
  }

  const getTeamStats = () => {
    const teamMap = new Map<string, { goals: number; assists: number; players: number }>()

    filterPlayers(playersData).forEach((player) => {
      const team = player.team === "NAN" ? "Free Agent" : player.team
      if (!teamMap.has(team)) {
        teamMap.set(team, { goals: 0, assists: 0, players: 0 })
      }
      const stats = teamMap.get(team)!
      stats.goals += player.goal
      stats.assists += player.assists
      stats.players += 1
    })

    return Array.from(teamMap.entries())
      .map(([team, stats]) => ({
        team,
        ...stats,
        avgGoalsPerPlayer: stats.goals / stats.players,
        avgAssistsPerPlayer: stats.assists / stats.players,
      }))
      .sort((a, b) => b.goals + b.assists - (a.goals + a.assists))
  }

  const getAgeGroupStats = () => {
    const ageGroups = {
      "Under 21": playersData.filter((p) => p.age < 21),
      "21-25": playersData.filter((p) => p.age >= 21 && p.age <= 25),
      "26-30": playersData.filter((p) => p.age >= 26 && p.age <= 30),
      "31+": playersData.filter((p) => p.age > 30),
    }

    return Object.entries(ageGroups).map(([group, players]) => ({
      group,
      count: players.length,
      totalGoals: players.reduce((sum, p) => sum + p.goal, 0),
      totalAssists: players.reduce((sum, p) => sum + p.assists, 0),
      avgRating: Math.round(players.reduce((sum, p) => sum + calculatePlayerRating(p), 0) / players.length),
    }))
  }

  const getTopPlayers = (category: keyof Player, limit = 10) => {
    const filtered = filterPlayers(playersData)
    return filtered.sort((a, b) => (b[category] as number) - (a[category] as number)).slice(0, limit)
  }

  const getPositionIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">{rank}</span>
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400"
    if (rank === 2) return "bg-slate-400/10 border-slate-400/30 text-slate-600 dark:text-slate-300"
    if (rank === 3) return "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
    return "bg-background border-border"
  }

  const formatPlayerName = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const positions = [...new Set(playersData.map((p) => p.position))].sort()
  const cardTypes = [...new Set(playersData.map((p) => p.cardType))].sort()

  const LeaderboardTable = ({
    players,
    statKey,
    statLabel,
    formatValue,
    showTrend = false,
    showConsistency = false,
  }: {
    players: Player[]
    statKey: keyof Player
    statLabel: string
    formatValue?: (value: number) => string
    showTrend?: boolean
    showConsistency?: boolean
  }) => (
    <div className="space-y-3">
      {players.map((player, index) => {
        const trend = getStatTrend(player)
        const consistency = calculateConsistencyRating(player)

        return (
          <Card key={player.id} className={`${getRankColor(index + 1)} transition-all hover:shadow-md cursor-pointer`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex items-center justify-center w-10 h-10">{getPositionIcon(index + 1)}</div>
                  <img
                    src={player.image || "/placeholder.svg?height=48&width=48&query=football player"}
                    alt={player.name}
                    className="w-24 h-34 rounded-none object-cover"
                  />
                  {/* change */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{formatPlayerName(player.name)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {player.position} • {player.team === "NAN" ? "Free Agent" : formatPlayerName(player.team)}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {player.cardType}
                      </Badge>
                      {showConsistency && (
                        <Badge variant="secondary" className="text-xs">
                          Consistency: {consistency}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  {showTrend && (
                    <div className="flex items-center gap-1">
                      {trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                      {trend === "down" && <TrendingDown className="w-4 h-4 text-red-500" />}
                      {trend === "stable" && <ZapIcon className="w-4 h-4 text-yellow-500" />}
                    </div>
                  )}
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {formatValue ? formatValue(player[statKey] as number) : player[statKey]}
                    </div>
                    <div className="text-sm text-muted-foreground">{statLabel}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">eFootball Leaderboards</h1>
          <p className="text-muted-foreground text-lg">
            Discover the top performers across different statistical categories and card types.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Search players or teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <Select value={positionFilter} onValueChange={setPositionFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Positions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Positions</SelectItem>
                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Card Type</label>
                <Select value={cardTypeFilter} onValueChange={setCardTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Cards" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cards</SelectItem>
                    {cardTypes.map((cardType) => (
                      <SelectItem key={cardType} value={cardType}>
                        {cardType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Age Group</label>
                <Select value={ageFilter} onValueChange={setAgeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Ages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="young">Under 25</SelectItem>
                    <SelectItem value="prime">26-32</SelectItem>
                    <SelectItem value="veteran">33+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 overflow-x-auto">
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="assists" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Assists</span>
            </TabsTrigger>
            <TabsTrigger value="efficiency" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Efficiency</span>
            </TabsTrigger>
            <TabsTrigger value="consistency" className="flex items-center gap-2">
              <Medal className="w-4 h-4" />
              <span className="hidden sm:inline">Consistency</span>
            </TabsTrigger>
            <TabsTrigger value="rating" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline">Rating</span>
            </TabsTrigger>
            <TabsTrigger value="age" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Appearances</span>
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Teams</span>
            </TabsTrigger>
            <TabsTrigger value="combinations" className="flex items-center gap-2">
              <ZapIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Combos</span>
            </TabsTrigger>
          </TabsList>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Top Goal Scorers
                  </CardTitle>
                  <CardDescription>Players with the most goals scored in eFootball</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const csv = exportRankingsAsCSV(getTopPlayers("goal"), "goal")
                    downloadCSV(csv, "top-goal-scorers.csv")
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <LeaderboardTable players={getTopPlayers("goal")} statKey="goal" statLabel="Goals" showTrend={true} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assists Tab */}
          <TabsContent value="assists" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Top Assist Providers
                  </CardTitle>
                  <CardDescription>Players with the most assists in eFootball</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const csv = exportRankingsAsCSV(getTopPlayers("assists"), "assists")
                    downloadCSV(csv, "top-assist-providers.csv")
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <LeaderboardTable
                  players={getTopPlayers("assists")}
                  statKey="assists"
                  statLabel="Assists"
                  showTrend={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Efficiency Tab */}
          <TabsContent value="efficiency" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Most Efficient Players
                </CardTitle>
                <CardDescription>Players with the best goals + assists per match ratio</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardTable
                  players={getTopPlayers("gAPm")}
                  statKey="gAPm"
                  statLabel="G+A per Match"
                  formatValue={(value) => value.toFixed(3)}
                  showTrend={true}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Head-to-Head: Top 2 Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getHeadToHead(getTopPlayers("gAPm"), "gAPm").map((player, idx) => (
                    <div key={player.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={player.image || "/placeholder.svg?height=48&width=48&query=football player"}
                          alt={player.name}
                          className="w-24 h-34 rounded-none object-cover"
                        />
                        {/* change */}
                        <div>
                          <h4 className="font-semibold">{formatPlayerName(player.name)}</h4>
                          <p className="text-sm text-muted-foreground">{player.position}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Goals:</span>
                          <span className="font-semibold">{player.goal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Assists:</span>
                          <span className="font-semibold">{player.assists}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>G+A/Match:</span>
                          <span className="font-semibold">{player.gAPm.toFixed(3)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consistency Tab */}
          <TabsContent value="consistency" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Medal className="w-5 h-5" />
                  Most Consistent Players
                </CardTitle>
                <CardDescription>Players with the most balanced and reliable performance</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardTable
                  players={getTopPlayers("goal")
                    .slice(0, 20)
                    .sort((a, b) => calculateConsistencyRating(b) - calculateConsistencyRating(a))}
                  statKey="goal"
                  statLabel="Goals"
                  showConsistency={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overall Rating Tab */}
          <TabsContent value="rating" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Overall Player Ratings
                </CardTitle>
                <CardDescription>Comprehensive player performance rating (0-100)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filterPlayers(playersData)
                    .sort((a, b) => calculatePlayerRating(b) - calculatePlayerRating(a))
                    .slice(0, 10)
                    .map((player, index) => (
                      <Card key={player.id} className={`${getRankColor(index + 1)}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center justify-center w-10 h-10">
                                {getPositionIcon(index + 1)}
                              </div>
                              <img
                                src={player.image || "/placeholder.svg?height=48&width=48&query=football player"}
                                alt={player.name}
                                className="w-24 h-34 rounded-none object-cover"
                              />
                              <div>
                                <h3 className="font-semibold">{formatPlayerName(player.name)}</h3>
                                <p className="text-sm text-muted-foreground">{player.position}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-primary">{calculatePlayerRating(player)}</div>
                              <div className="text-sm text-muted-foreground">Overall Rating</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Most Appearances Tab */}
          <TabsContent value="age" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Most Appearances
                </CardTitle>
                <CardDescription>Players with the highest number of appearances</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardTable
                  players={getTopPlayers("apps")}
                  statKey="apps"
                  statLabel="Appearances"
                  showTrend={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Team Leaderboards
                </CardTitle>
                <CardDescription>Team statistics and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getTeamStats()
                    .slice(0, 10)
                    .map((team, index) => (
                      <Card key={team.team} className={`${getRankColor(index + 1)}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center justify-center w-10 h-10">
                                {getPositionIcon(index + 1)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{formatPlayerName(team.team)}</h3>
                                <p className="text-sm text-muted-foreground">{team.players} players</p>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <div className="text-2xl font-bold text-primary">{team.goals + team.assists}</div>
                              <div className="text-sm text-muted-foreground">Total G+A</div>
                              <div className="text-xs text-muted-foreground">
                                {team.avgGoalsPerPlayer.toFixed(1)} G/P • {team.avgAssistsPerPlayer.toFixed(1)} A/P
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Best Combinations Tab */}
          <TabsContent value="combinations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ZapIcon className="w-5 h-5" />
                  Best Player Combinations
                </CardTitle>
                <CardDescription>Top player pairs for team building</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {findBestCombinations(filterPlayers(playersData)).map((combo, idx) => (
                    <Card key={idx} className="bg-muted/50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-3">Combination #{idx + 1}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {combo.map((player) => (
                            <div key={player.id} className="flex items-center gap-3">
                              <img
                                src={player.image || "/placeholder.svg?height=40&width=40&query=football player"}
                                alt={player.name}
                                className="w-24 h-34 rounded-none object-cover"
                              />
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{formatPlayerName(player.name)}</p>
                                <p className="text-xs text-muted-foreground">Rating: {calculatePlayerRating(player)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm">
                            <span className="font-semibold">Combined Rating:</span>{" "}
                            {combo.reduce((sum, p) => sum + calculatePlayerRating(p), 0)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{filterPlayers(playersData).length}</div>
              <p className="text-sm text-muted-foreground">In current filter</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {filterPlayers(playersData)
                  .reduce((sum, player) => sum + player.goal, 0)
                  .toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Across all players</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Assists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {filterPlayers(playersData)
                  .reduce((sum, player) => sum + player.assists, 0)
                  .toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Across all players</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Avg Player Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {Math.round(
                  filterPlayers(playersData).reduce((sum, p) => sum + calculatePlayerRating(p), 0) /
                    filterPlayers(playersData).length,
                )}
              </div>
              <p className="text-sm text-muted-foreground">Overall average</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
