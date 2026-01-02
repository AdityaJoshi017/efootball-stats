"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Target, Trophy, LineChart, Zap, Activity, Edit, Search } from "lucide-react"
import { Player, usePlayers } from "@/lib/use-players"
import { useRouter } from "next/navigation"
import { getCareerSummary, calculateEIS, reliabilityFactor, positionWeights, PlayerCard } from "@/lib/analytics/analytics"
import { ChangeEvent } from "react"

// Calculate similarity score between two players based on performance metrics
const calculateSimilarityScore = (player1: Player, player2: Player): number => {
  // Weights for different metrics (adjust these to prioritize certain stats)
  const WEIGHTS = {
    gPm: 0.4,    // Goals per match
    aPm: 0.4,    // Assists per match
    gAPm: 0.2,   // Goals + Assists per match
  }

  // Calculate normalized differences (0 to 1 scale) for each metric
  const gPmDiff = 1 - Math.min(
    Math.abs((player1.gPm - player2.gPm) / Math.max(0.1, Math.max(player1.gPm, player2.gPm))), 
    1
  )
  
  const aPmDiff = 1 - Math.min(
    Math.abs((player1.aPm - player2.aPm) / Math.max(0.1, Math.max(player1.aPm, player2.aPm))), 
    1
  )
  
  const gAPmDiff = 1 - Math.min(
    Math.abs((player1.gAPm - player2.gAPm) / Math.max(0.1, Math.max(player1.gAPm, player2.gAPm))), 
    1
  )

  // Calculate weighted score (0 to 1)
  const similarityScore = 
    (gPmDiff * WEIGHTS.gPm) + 
    (aPmDiff * WEIGHTS.aPm) + 
    (gAPmDiff * WEIGHTS.gAPm)

  // Add a small bonus for same position (0.05 = 5% bonus)
  const positionBonus = player1.position === player2.position ? 0.05 : 0
  
  return Math.min(similarityScore + positionBonus, 1) // Cap at 1
}

export default function StatsPage() {
  const router = useRouter()
  const { players: playersData } = usePlayers()
  const [selectedPosition, setSelectedPosition] = useState<string>("all")
  const [selectedCardType, setSelectedCardType] = useState<string>("all")


// 
const [similarBasePlayer, setSimilarBasePlayer] = useState<Player | null>(null)
const [similarSearch, setSimilarSearch] = useState("")
const similarSearchResults = useMemo(() => {
  if (!similarSearch) return []
  return playersData
    .filter(p =>
      p.name.toLowerCase().includes(similarSearch.toLowerCase())
    )
    .slice(0, 6)
}, [similarSearch, playersData])


// 

  const filteredPlayers = useMemo(() => {
    return playersData.filter((player) => {
      const positionMatch = selectedPosition === "all" || player.position === selectedPosition
      const cardTypeMatch = selectedCardType === "all" || player.cardType === selectedCardType
      return positionMatch && cardTypeMatch
    })
  }, [selectedPosition, selectedCardType, playersData])

  const positions = [...new Set(playersData.map((p) => p.position))].sort()
  const cardTypes = [...new Set(playersData.map((p) => p.cardType))].sort()

  const getOverallStats = () => {
    const totalPlayers = filteredPlayers.length
    const totalGoals = filteredPlayers.reduce((sum, p) => sum + p.goal, 0)
    const totalAssists = filteredPlayers.reduce((sum, p) => sum + p.assists, 0)
    const totalApps = filteredPlayers.reduce((sum, p) => sum + p.apps, 0)
    const avgAge = filteredPlayers.reduce((sum, p) => sum + p.age, 0) / totalPlayers
    const avgGPM = filteredPlayers.reduce((sum, p) => sum + p.gPm, 0) / totalPlayers
    const avgAPM = filteredPlayers.reduce((sum, p) => sum + p.aPm, 0) / totalPlayers

    return {
      totalPlayers,
      totalGoals,
      totalAssists,
      totalApps,
      avgAge: avgAge.toFixed(1),
      avgGPM: avgGPM.toFixed(3),
      avgAPM: avgAPM.toFixed(3),
    }
  }

  const getPositionStats = () => {
    const positionGroups = positions.map((position) => {
      const positionPlayers = filteredPlayers.filter((p) => p.position === position)
      if (positionPlayers.length === 0) return null
      
      return {
        position,
        playerCount: positionPlayers.length,
        avgGoals: (positionPlayers.reduce((sum, p) => sum + p.goal, 0) / positionPlayers.length).toFixed(1),
        avgAssists: (positionPlayers.reduce((sum, p) => sum + p.assists, 0) / positionPlayers.length).toFixed(1),
        avgGPM: (positionPlayers.reduce((sum, p) => sum + p.gPm, 0) / positionPlayers.length).toFixed(3),
        avgAPM: (positionPlayers.reduce((sum, p) => sum + p.aPm, 0) / positionPlayers.length).toFixed(3),
        topPlayer: positionPlayers.reduce((top, p) => (p.gAPm > top.gAPm ? p : top)),
      }
    }).filter(Boolean)
    return positionGroups
  }

  const getCardTypeStats = () => {
    const cardTypeGroups = cardTypes.map((cardType) => {
      const cardTypePlayers = filteredPlayers.filter((p) => p.cardType === cardType)
      return {
        cardType,
        count: cardTypePlayers.length,
        avgGoals: (cardTypePlayers.reduce((sum, p) => sum + p.goal, 0) / cardTypePlayers.length).toFixed(1),
        avgAssists: (cardTypePlayers.reduce((sum, p) => sum + p.assists, 0) / cardTypePlayers.length).toFixed(1),
      }
    })
    return cardTypeGroups
  }

  // Get player career summaries
  const getPlayerCareers = () => {
    const playerMap = new Map()
    
    playersData.forEach(player => {
      if (!playerMap.has(player.name)) {
        playerMap.set(player.name, [])
      }
      playerMap.get(player.name).push(player)
    })

    return Array.from(playerMap.entries())
      .map(([_, cards]) => ({
        ...getCareerSummary(cards),
        reliability: reliabilityFactor(cards.reduce((sum: number, card: PlayerCard) => sum + card.apps, 0)),
        eis: calculateEIS(cards[0])?.EIS.toFixed(2) || 'N/A'
      }))
      .sort((a, b) => b.gAPm - a.gAPm) // Sort by G+A per match
  }

  // Get position analysis
  const getEnhancedPositionStats = () => {
    return positions.map(position => {
      const positionPlayers = filteredPlayers.filter(p => p.position === position)
      if (positionPlayers.length === 0) return null
      
      const weights = positionWeights[position] || { goal: 0.5, assist: 0.5 }
      const totalImpact = positionPlayers.reduce((sum, p) => {
        return sum + (p.gPm * weights.goal + p.aPm * weights.assist)
      }, 0)
      
      const avgImpact = (totalImpact / positionPlayers.length).toFixed(3)
      
      return {
        position,
        playerCount: positionPlayers.length,
        avgImpact,
        expectedGPM: weights.goal.toFixed(2),
        expectedAPM: weights.assist.toFixed(2),
        topPlayer: positionPlayers.reduce((top, p) => (p.gAPm > top.gAPm ? p : top))
      }
    }).filter(Boolean)
  }

  const stats = getOverallStats()
  const positionStats = getPositionStats()
  const cardTypeStats = getCardTypeStats()

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-foreground">eFootball Statistics</h1>
            <button
              onClick={() => router.push('/stats-update')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Edit className="w-4 h-4 mr-2" />
              Update Stats
            </button>
          </div>
          <p className="text-muted-foreground text-lg">
            Comprehensive analytics and insights about player performance.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-medium">Position</label>
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
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
            <Select value={selectedCardType} onValueChange={setSelectedCardType}>
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
        </div>

        {/* Overview Stats */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="positions" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Positions
            </TabsTrigger>
            <TabsTrigger value="cardtypes" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Card Types
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
                
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Card className="h-full">
                <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Players</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-1 sm:pt-0">
                  <div className="text-xl sm:text-2xl font-bold">{stats.totalPlayers}</div>
                </CardContent>
              </Card>
              <Card className="h-full">
                <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Goals</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-1 sm:pt-0">
                  <div className="text-xl sm:text-2xl font-bold">{stats.totalGoals.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="h-full">
                <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Assists</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-1 sm:pt-0">
                  <div className="text-xl sm:text-2xl font-bold">{stats.totalAssists.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="h-full">
                <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
                  <CardTitle className="text-xs sm:text-sm font-medium">Avg Age</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-1 sm:pt-0">
                  <div className="text-xl sm:text-2xl font-bold">{stats.avgAge}</div>
                </CardContent>
              </Card>
            </div>

            {/* Similar Players Search */}
            <Card>
              <CardHeader>
                <CardTitle>Find Similar Players</CardTitle>
                <CardDescription>Search for a player to find similar players</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search for a player..."
                    className="pl-10"
                    value={similarSearch}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSimilarSearch(e.target.value)}
                  />
                </div>

                {/* Search Results Dropdown */}
                {similarSearch && similarSearchResults.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    {similarSearchResults.map((player) => (
                      <div 
                        key={player.id}
                        className="p-3 hover:bg-muted/50 cursor-pointer flex items-center gap-3"
                        onClick={() => {
                          setSimilarBasePlayer(player);
                          setSimilarSearch("");
                        }}
                      >
                        <img 
                          src={player.image || "/placeholder.svg"} 
                          alt={player.name}
                          className="w-10 h-14 object-cover rounded"
                        />
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {player.position} • {player.team}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Player */}
                {similarBasePlayer && (
                  <div className="mt-6 space-y-4">
                    <h3 className="font-medium">Selected Player:</h3>
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <img 
                        src={similarBasePlayer.image || "/placeholder.svg"} 
                        alt={similarBasePlayer.name}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div>
                        <h4 className="text-lg font-semibold">{similarBasePlayer.name}</h4>
                        <div className="text-sm text-muted-foreground">
                          <span className="inline-block mr-2">{similarBasePlayer.position}</span>
                          <span>•</span>
                          <span className="ml-2">{similarBasePlayer.team}</span>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {similarBasePlayer.cardType}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {similarBasePlayer.apps} apps
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Similar Players */}
                    <div className="mt-6">
                      <h3 className="font-medium mb-3">Similar Players:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {playersData
                          .filter(p => p.id !== similarBasePlayer.id)
                          .map(player => ({
                            ...player,
                            similarityScore: calculateSimilarityScore(similarBasePlayer, player)
                          }))
                          .sort((a, b) => b.similarityScore - a.similarityScore)
                          .slice(0, 6)
                          .map(player => (
                            <div 
                              key={player.id}
                              className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                              onClick={() => setSimilarBasePlayer(player)}
                            >
                              <div className="flex items-center gap-3">
                                <img 
                                  src={player.image || "/placeholder.svg"} 
                                  alt={player.name}
                                  className="w-12 h-16 object-cover rounded"
                                />
                                <div>
                                  <div className="font-medium">{player.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {player.position} • {player.team}
                                  </div>
                                  <div className="flex gap-1 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {player.gPm.toFixed(2)} G/90
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {player.aPm.toFixed(2)} A/90
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
                
          <TabsContent value="positions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Position Analysis
                </CardTitle>
                <CardDescription>Stats by player position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {positionStats.filter((pos): pos is NonNullable<typeof pos> => pos !== null).map((pos) => (
                  <div key={pos.position} className="p-3 rounded-lg border relative">
                    <div className="font-semibold mb-2">{pos.position}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Players</p>
                        <p className="font-bold">{pos.playerCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Avg G/M</p>
                        <p className="font-bold">{pos.avgGPM}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Avg A/M</p>
                        <p className="font-bold">{pos.avgAPM}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Top Player</p>
                        <p className="font-bold text-xs">
                          {pos.topPlayer.name}
                        </p>
                      </div>
                    </div>
                    <img
                      src={pos.topPlayer.image || "/placeholder.svg"}
                      alt={pos.topPlayer.name}
                      className="absolute top-3 right-3 w-18 h-25.5 object-cover rounded-md shadow-sm"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cardtypes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Type Analysis</CardTitle>
                <CardDescription>Performance metrics by card type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cardTypeStats.map((card) => (
                    <div key={card.cardType} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold capitalize">{card.cardType}</h3>
                        <Badge>{card.count} players</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Avg Goals</p>
                          <p className="font-bold">{card.avgGoals}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Assists</p>
                          <p className="font-bold">{card.avgAssists}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6">
              {/* Player Careers Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Player Career Analytics
                  </CardTitle>
                  <CardDescription>
                    Aggregated statistics across all cards for each player
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto -mx-2 sm:mx-0">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-1.5 sm:p-2">Player</th>
                          <th className="text-right p-1.5 sm:p-2">Apps</th>
                          <th className="text-right p-1 sm:p-2">G</th>
                          <th className="text-right p-1 sm:p-2">A</th>
                          <th className="text-right p-1 sm:p-2">G+A/90</th>
                          <th className="text-right p-1 sm:p-2 hidden md:table-cell">EIS</th>
                          <th className="text-right p-1 sm:p-2 hidden sm:table-cell">Rel</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPlayerCareers().slice(0, 10).map((player) => (
                          <tr key={player.name} className="border-b hover:bg-muted/50">
                            <td className="p-1.5 sm:p-2 font-medium truncate max-w-[100px] sm:max-w-none">
                              {player.name}
                            </td>
                            <td className="p-1.5 sm:p-2 text-right">{player.totalApps}</td>
                            <td className="p-1.5 sm:p-2 text-right">{player.totalGoals}</td>
                            <td className="p-1.5 sm:p-2 text-right">{player.totalAssists}</td>
                            <td className="p-1.5 sm:p-2 text-right hidden sm:table-cell">{player.totalAssists}</td>
                            <td className="p-1.5 sm:p-2 text-right font-medium">{player.gAPm.toFixed(2)}</td>
                            <td className="p-1.5 sm:p-2 text-right hidden md:table-cell">{player.eis}</td>
                            <td className="p-1.5 sm:p-2 text-right hidden sm:table-cell">
                              <div className="flex items-center justify-end gap-1">
                                <div 
                                  className={`h-2 w-2 rounded-full ${
                                    player.reliability > 0.7 ? 'bg-green-500' : 
                                    player.reliability > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`} 
                                />
                                {player.reliability > 0.7 ? 'High' : player.reliability > 0.4 ? 'Medium' : 'Low'}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Position Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Position Analysis
                  </CardTitle>
                  <CardDescription>
                    Performance metrics weighted by position expectations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {getEnhancedPositionStats().map((pos: any) => (
                      <div key={pos.position} className="border rounded-lg p-3 sm:p-4 bg-card hover:bg-card/80 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm sm:text-base">{pos.position}</h3>
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{pos.playerCount} players</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-muted/20 p-2 rounded">
                            <p className="text-xs text-muted-foreground">Avg Impact</p>
                            <p className="font-bold text-sm">{pos.avgImpact}</p>
                          </div>
                          <div className="bg-muted/20 p-2 rounded">
                            <p className="text-xs text-muted-foreground">Exp. GPM</p>
                            <p className="font-bold text-sm">{pos.expectedGPM}</p>
                          </div>
                          <div className="bg-muted/20 p-2 rounded">
                            <p className="text-xs text-muted-foreground">Exp. APM</p>
                            <p className="font-bold text-sm">{pos.expectedAPM}</p>
                          </div>
                          <div className="bg-muted/20 p-2 rounded">
                            <p className="text-xs text-muted-foreground">G+A/90</p>
                            <p className="font-bold text-sm">{pos.topPlayer.gAPm.toFixed(2)}</p>
                          </div>
                        </div>
                        
                       <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Top Performer</p>

                        <div className="flex justify-between items-center text-sm gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-12 h-[68px] relative flex-shrink-0">
                              <img
                                src={pos.topPlayer.image || "/placeholder.svg"}
                                alt={pos.topPlayer.name}
                                className="w-full h-full object-cover rounded-sm"
                              />
                            </div>
                            <span className="font-medium truncate">
                              {pos.topPlayer.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Legend */}
              <div className="text-xs sm:text-sm text-muted-foreground">
                <p className="font-medium mb-2">Legend:</p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                    <span>EIS (eFootball Impact Score): Position-weighted performance metric (0-100)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span>Reliability: Based on total appearances (more appearances = higher reliability)</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
