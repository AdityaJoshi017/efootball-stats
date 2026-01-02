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
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <img
                  src={player.image || "/placeholder.svg?height=120&width=120&query=football player"}
                  alt={player.name}
                  className="w-20 h-28 md:w-24 md:h-34 rounded-none object-cover border-background shadow-md mx-auto md:mx-0"
                />
                <div className="flex-1 w-full">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
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
                    <div className="grid grid-cols-2 gap-2 w-full md:w-auto md:flex md:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`w-full md:w-auto ${isFavorite ? "bg-red-300 border-red-300 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-500 dark:hover:bg-red-900/30" : ""}`}
                        onClick={() => {
                          const currentUserRaw = localStorage.getItem("currentUser")
                          if (!currentUserRaw) {
                            router.push("/auth/login")
                            return
                          }

                          const next = toggleFavouritePlayer(playerId)
                          setIsFavorite(next)
                        }}
                      >
                        <Heart
                          className={`w-4 h-4 mr-1 md:mr-2 ${
                            isFavorite ? "fill-red-600 text-red-800" : ""
                          }`}
                        />
                        <span className="text-foreground text-xs md:text-sm">
                          {isFavorite ? "Favorited" : "Fav"}
                        </span>
                      </Button>

                      <Button variant="outline" size="sm" className="w-full md:w-auto" asChild>
                        <Link href={`/compare?playerId=${playerId}`} className="flex items-center">
                          <ArrowRightLeft className="w-4 h-4 mr-1 md:mr-2" />
                          <span className="text-xs md:text-sm">Compare</span>
                        </Link>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full md:w-auto col-span-2 md:col-auto"
                        onClick={() =>
                          router.push(
                            `/stats-update?playerId=${playerId}&playerName=${encodeURIComponent(player.name)}`
                          )
                        }
                      >
                        <span className="text-xs md:text-sm">Update Stats</span>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full md:w-auto col-span-2 md:col-auto">
                        <Share2 className="w-4 h-4 mr-1 md:mr-2" />
                        <span className="text-xs md:text-sm">Share</span>
                      </Button>
                      
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mt-4">
                    <div className="text-center p-2 bg-muted/20 rounded-lg">
                      <div className="text-xl md:text-2xl font-bold text-primary">{player.apps}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">Apps</div>
                    </div>
                    <div className="text-center p-2 bg-muted/20 rounded-lg">
                      <div className="text-xl md:text-2xl font-bold text-primary">{player.goal}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">Goals</div>
                    </div>
                    <div className="text-center p-2 bg-muted/20 rounded-lg">
                      <div className="text-xl md:text-2xl font-bold text-primary">{player.assists}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">Assists</div>
                    </div>
                    <div className="text-center p-2 bg-muted/20 rounded-lg">
                      <div className="text-xl md:text-2xl font-bold text-primary">{player.gAPm.toFixed(3)}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">G+A/Match</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <div className="overflow-x-auto pb-1">
            <TabsList className="w-full grid grid-cols-4 min-w-[400px] md:min-w-0">
              <TabsTrigger value="overview" className="text-xs md:text-sm px-2 py-1">Overview</TabsTrigger>
              <TabsTrigger value="performance" className="text-xs md:text-sm px-2 py-1">Performance</TabsTrigger>
              <TabsTrigger value="rankings" className="text-xs md:text-sm px-2 py-1">Rankings</TabsTrigger>
              <TabsTrigger value="similar" className="text-xs md:text-sm px-2 py-1">Similar</TabsTrigger>
            </TabsList>
          </div>

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
                      <div className="flex items-center space-x-3 p-3 md:p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                        <img
                          src={similarPlayer.image || "/placeholder.svg?height=48&width=48&query=football player"}
                          alt={similarPlayer.name}
                          className="w-16 h-24 md:w-24 md:h-34 rounded-none object-cover"
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
