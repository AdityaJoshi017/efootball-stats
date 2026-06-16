"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { usePlayers, type Player } from "@/lib/use-players"
import { calculatePlayerRating } from "@/lib/leaderboard-utils"

export function TopPerformersCarousel() {
  const { players } = usePlayers()

  const topPerformers = useMemo(() => {
    if (!players || players.length === 0) return []

    return players
      .map((player) => ({
        ...player,
        rating: calculatePlayerRating(player),
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8)
  }, [players])

  if (topPerformers.length === 0) {
    return null
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Top Performers</h2>
            <p className="text-muted-foreground mt-2">Highest-rated players in the database</p>
          </div>
          <Link href="/leaderboards">
            <Button variant="outline" className="flex items-center gap-2">
              View All
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topPerformers.map((player, index) => (
            <Link key={player.id} href={`/players/${player.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-primary">#{index + 1}</div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{player.name}</h3>
                        <p className="text-sm text-muted-foreground">{player.team}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Badge variant="default" className="mb-2">
                      {player.position}
                    </Badge>
                  </div>

                  <div className="space-y-3 bg-muted p-3 rounded-lg mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Rating</span>
                      <span className="font-bold text-primary">{player.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Goals</span>
                      <span className="font-semibold">{player.goal}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Assists</span>
                      <span className="font-semibold">{player.assists}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Age</span>
                      <span className="font-semibold">{player.age}</span>
                    </div>
                  </div>

                  <Button className="w-full" size="sm">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
