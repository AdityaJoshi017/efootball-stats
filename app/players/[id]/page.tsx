"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Share2, Heart, BarChart3, Trophy, Target, Users, Calendar, MapPin, ArrowRightLeft } from "lucide-react"
import { usePlayers, type Player } from "@/lib/use-players"
import { useRouter } from "next/navigation"
import { buildLeaderboardBadges } from "@/lib/leaderboard-badges"
import { isFavouritePlayer, toggleFavouritePlayer } from "@/lib/favourites"

export default function PlayerDetailPage() {
  const params = useParams()
  const playerId = Number.parseInt(params.id as string)
  const { players: playersData } = usePlayers()
  const player = playersData.find((p) => p.id === playerId)
  const [isFavorite, setIsFavorite] = useState(false)
  const leaderboardBadgesByPlayerId = buildLeaderboardBadges(playersData, 10)
  const playerBadges = leaderboardBadgesByPlayerId.get(playerId) ?? []
  const router = useRouter()

  useEffect(() => {
    setIsFavorite(isFavouritePlayer(playerId))
  }, [playerId])

  if (!player) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center p-8">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4">Player Not Found</h2>
            <p className="text-muted-foreground mb-4">The player you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/players">Back to Players</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatPlayerName = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const   getPerformanceRating = (player: Player) => {
    const goalRating = Math.min(player.gPm * 100, 100)
    const assistRating = Math.min(player.aPm * 100, 100)
    const efficiencyRating = Math.min(player.gAPm * 100, 100)
    const experienceRating = Math.min(player.apps / 10, 100)

    return {
      attacking: goalRating,
      playmaking: assistRating,
      efficiency: efficiencyRating,
      experience: experienceRating,
      overall: (goalRating + assistRating + efficiencyRating + experienceRating) / 4,
    }
  }
//changed
  const getPlayerRank = (stat: keyof Player) => {
    const sortedPlayers = [...playersData].sort(
  (a, b) => (b[stat] as number) - (a[stat] as number)
)
    return sortedPlayers.findIndex((p) => p.id === player.id) + 1
  }

  const getSimilarPlayers = () => {
    return playersData
      .filter((p) => p.id !== player.id && p.position === player.position)
      .sort((a, b) => Math.abs(b.gAPm - player.gAPm) - Math.abs(a.gAPm - player.gAPm))
      .slice(0, 3)
  }

  const ratings = getPerformanceRating(player)
  const similarPlayers = getSimilarPlayers()

  return (
    <div className="min-h-screen bg-background">
      {/* Player Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <img
                  src={player.image || "/placeholder.svg?height=120&width=120&query=football player"}
                  alt={player.name}
                  className="w-24 h-34 rounded-none object-cover  border-background shadow-md"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-4xl font-bold text-foreground mb-2">{formatPlayerName(player.name)}</h1>
                      <div className="flex items-center gap-4 text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {player.team === "NAN" ? "Free Agent" : formatPlayerName(player.team)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {player.position}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {player.age} years old
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-lg font-bold px-4 py-2">
                        {player.cardType}
                      </Badge>
                      {playerBadges.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {playerBadges.map((b) => (
                            <Badge key={`${b.key}-${b.rank}`} variant="secondary" className="text-sm font-bold">
                              {b.emoji} #{b.rank} {b.label}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentUserRaw = localStorage.getItem("currentUser")
                          if (!currentUserRaw) {
                            router.push("/auth/login")
                            return
                          }

                          const next = toggleFavouritePlayer(playerId)
                          setIsFavorite(next)
                        }}
                        className={isFavorite ? "bg-red-300 border-red-300 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-500 dark:hover:bg-red-900/30" : ""}>
                        <Heart
                          className={`w-4 h-4 mr-2 ${
                            isFavorite ? "fill-red-600 text-red-800" : ""
                          }`}
                        />
                        <span className="text-foreground">
                          {isFavorite ? "Favorited" : "Add to Favorites"}
                        </span>
                      </Button>

                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/compare?playerId=${playerId}`}>
                          <ArrowRightLeft className="w-4 h-4 mr-2" />
                          Compare
                        </Link>
                      </Button>

                      {/* <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => router.push('/stats-update')}
                        className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Update Stats
                      </Button> */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/stats-update?playerId=${playerId}&playerName=${encodeURIComponent(player.name)}`
                          )
                        }>
                        Update Stats
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{player.apps}</div>
                      <div className="text-sm text-muted-foreground">Appearances</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{player.goal}</div>
                      <div className="text-sm text-muted-foreground">Goals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{player.assists}</div>
                      <div className="text-sm text-muted-foreground">Assists</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{player.gAPm.toFixed(3)}</div>
                      <div className="text-sm text-muted-foreground">G+A/Match</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
            <TabsTrigger value="similar">Similar Players</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Career Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Career Statistics
                  </CardTitle>
                  <CardDescription>Complete eFootball career overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Total Goals</span>
                        <span className="text-sm font-bold">{player.goal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Total Assists</span>
                        <span className="text-sm font-bold">{player.assists}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Goals + Assists</span>
                        <span className="text-sm font-bold">{player.gPlusA}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Goals/Match</span>
                        <span className="text-sm font-bold">{player.gPm.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Assists/Match</span>
                        <span className="text-sm font-bold">{player.aPm.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">G+A/Match</span>
                        <span className="text-sm font-bold">{player.gAPm.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Ratings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Performance Ratings
                  </CardTitle>
                  <CardDescription>notAI-calculated performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Attacking</span>
                        <span className="text-sm font-bold">{ratings.attacking.toFixed(0)}/100</span>
                      </div>
                      <Progress value={ratings.attacking} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Playmaking</span>
                        <span className="text-sm font-bold">{ratings.playmaking.toFixed(0)}/100</span>
                      </div>
                      <Progress value={ratings.playmaking} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Efficiency</span>
                        <span className="text-sm font-bold">{ratings.efficiency.toFixed(0)}/100</span>
                      </div>
                      <Progress value={ratings.efficiency} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Experience</span>
                        <span className="text-sm font-bold">{ratings.experience.toFixed(0)}/100</span>
                      </div>
                      <Progress value={ratings.experience} className="h-2" />
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Overall Rating</span>
                      <span className="text-2xl font-bold text-primary">{ratings.overall.toFixed(0)}/100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Goal Scoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">{player.goal}</div>
                    <div className="text-sm text-muted-foreground mb-4">Total Goals</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Goals per Match</span>
                        <span className="font-bold">{player.gPm.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Goal Contribution</span>
                        <span className="font-bold">{((player.goal / player.gPlusA) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Playmaking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">{player.assists}</div>
                    <div className="text-sm text-muted-foreground mb-4">Total Assists</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Assists per Match</span>
                        <span className="font-bold">{player.aPm.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Assist Contribution</span>
                        <span className="font-bold">{((player.assists / player.gPlusA) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Overall Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">{player.gPlusA}</div>
                    <div className="text-sm text-muted-foreground mb-4">Goals + Assists</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>G+A per Match</span>
                        <span className="font-bold">{player.gAPm.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Impact Rate</span>
                        <span className="font-bold">{((player.gPlusA / player.apps) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rankings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Global Rankings
                </CardTitle>
                <CardDescription>How this player ranks among all eFootball players</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="font-medium">Goals Ranking</span>
                      <Badge variant="secondary" className="text-lg font-bold">
                        #{getPlayerRank("goal")}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="font-medium">Assists Ranking</span>
                      <Badge variant="secondary" className="text-lg font-bold">
                        #{getPlayerRank("assists")}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="font-medium">Appearances Ranking</span>
                      <Badge variant="secondary" className="text-lg font-bold">
                        #{getPlayerRank("apps")}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="font-medium">Goals/Match Ranking</span>
                      <Badge variant="secondary" className="text-lg font-bold">
                        #{getPlayerRank("gPm")}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="font-medium">Assists/Match Ranking</span>
                      <Badge variant="secondary" className="text-lg font-bold">
                        #{getPlayerRank("aPm")}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="font-medium">G+A/Match Ranking</span>
                      <Badge variant="secondary" className="text-lg font-bold">
                        #{getPlayerRank("gAPm")}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="similar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Similar Players</CardTitle>
                <CardDescription>Players with similar performance profiles in the same position</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {similarPlayers.map((similarPlayer) => (
                    <Link key={similarPlayer.id} href={`/players/${similarPlayer.id}`}>
                      <div className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                        <img
                          src={similarPlayer.image || "/placeholder.svg?height=48&width=48&query=football player"}
                          alt={similarPlayer.name}
                          className="w-24 h-34 rounded-none object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{formatPlayerName(similarPlayer.name)}</h3>
                          <p className="text-sm text-muted-foreground">
                            {similarPlayer.position} •{" "}
                            {similarPlayer.team === "NAN" ? "Free Agent" : formatPlayerName(similarPlayer.team)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{similarPlayer.gAPm.toFixed(3)}</div>
                          <div className="text-sm text-muted-foreground">G+A/Match</div>
                        </div>
                        <Badge variant="outline">{similarPlayer.cardType}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
