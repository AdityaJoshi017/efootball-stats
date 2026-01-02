"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePlayers } from "@/lib/use-players"
import { getFavouritePlayerIds, toggleFavouritePlayer } from "@/lib/favourites"
import { Heart } from "lucide-react"

export default function FavouritesPage() {
  const { players } = usePlayers()
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [favouriteIds, setFavouriteIds] = useState<number[]>([])

  useEffect(() => {
    const currentUserRaw = localStorage.getItem("currentUser")
    setIsSignedIn(Boolean(currentUserRaw))

    if (!currentUserRaw) {
      setFavouriteIds([])
      return
    }

    setFavouriteIds(getFavouritePlayerIds())
  }, [])

  const favouritePlayers = useMemo(() => {
    const favSet = new Set(favouriteIds)
    return players.filter((p) => favSet.has(p.id))
  }, [players, favouriteIds])

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Favourites</CardTitle>
              <CardDescription>You need to sign in to view your favourite players.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Favourites</h1>
            <p className="text-muted-foreground">Your saved players</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/players">Browse Players</Link>
          </Button>
        </div>

        {favouritePlayers.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No favourites yet</CardTitle>
              <CardDescription>Open any player and tap “Add to Favorites”.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/players">Go to Players</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favouritePlayers.map((player) => (
              <Card key={player.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl">{player.name}</CardTitle>
                      <CardDescription>
                        {player.position} • {player.team === "NAN" ? "Free Agent" : player.team}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 border-red-200"
                      onClick={() => {
                        const next = toggleFavouritePlayer(player.id)
                        setFavouriteIds((prev) => {
                          const prevSet = new Set(prev)
                          if (next) prevSet.add(player.id)
                          else prevSet.delete(player.id)
                          return Array.from(prevSet)
                        })
                      }}
                      title="Remove from favourites"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{player.cardType}</Badge>
                    <Badge variant="outline">Apps: {player.apps}</Badge>
                    <Badge variant="outline">Goals: {player.goal}</Badge>
                    <Badge variant="outline">Assists: {player.assists}</Badge>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/players/${player.id}`}>View Player</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
