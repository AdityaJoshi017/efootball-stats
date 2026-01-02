"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { usePlayers, type Player } from "@/lib/use-players"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowUp, ArrowDown, Minus, Check, Loader2, Plus, X } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

type Derived = {
  gPm: number
  aPm: number
  gAPm: number
}

const calcDerived = (apps: number, goal: number, assists: number): Derived => {
  if (apps <= 0) return { gPm: 0, aPm: 0, gAPm: 0 }
  return {
    gPm: goal / apps,
    aPm: assists / apps,
    gAPm: (goal + assists) / apps,
  }
}

const Trend = ({ before, after }: { before: number; after: number }) => {
  if (after > before) {
    return (
      <span className="inline-flex items-center gap-1 text-green-600">
        <ArrowUp className="w-4 h-4" />
        {after.toFixed(3)}
      </span>
    )
  }

  if (after < before) {
    return (
      <span className="inline-flex items-center gap-1 text-red-600">
        <ArrowDown className="w-4 h-4" />
        {after.toFixed(3)}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <Minus className="w-4 h-4" />
      {after.toFixed(3)}
    </span>
  )
}

export default function StatsUpdatePage() {
  const searchParams = useSearchParams()
  const { players, isLoading, updatePlayer } = usePlayers()
  const [selectedId, setSelectedId] = useState<string>("")
  const urlPlayerProcessed = useRef(false)

  // Add player from URL parameter if present
  useEffect(() => {
    const playerName = searchParams?.get('playerName')
    if (playerName && players.length > 0 && !urlPlayerProcessed.current) {
      // Find player by name (case insensitive, partial match)
      const player = players.find(p => 
        p.name.toLowerCase().includes(playerName.toLowerCase())
      )
      if (player) {
        setSelectedId(String(player.id))
        urlPlayerProcessed.current = true
      }
    }
  }, [searchParams, players])

  const selectedPlayer: Player | undefined = useMemo(() => {
    const id = Number(selectedId)
    if (!Number.isFinite(id)) return undefined
    return players.find((p) => p.id === id)
  }, [players, selectedId])

  const [apps, setApps] = useState<string>("")
  const [goal, setGoal] = useState<string>("")
  const [assists, setAssists] = useState<string>("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!selectedPlayer) {
      setApps("")
      setGoal("")
      setAssists("")
      setSaved(false)
      return
    }

    setApps(String(selectedPlayer.apps))
    setGoal(String(selectedPlayer.goal))
    setAssists(String(selectedPlayer.assists))
    setSaved(false)
  }, [selectedPlayer])

  const parsed = useMemo(() => {
    const nextApps = Math.max(0, Number(apps))
    const nextGoal = Math.max(0, Number(goal))
    const nextAssists = Math.max(0, Number(assists))
    return {
      apps: Number.isFinite(nextApps) ? nextApps : 0,
      goal: Number.isFinite(nextGoal) ? nextGoal : 0,
      assists: Number.isFinite(nextAssists) ? nextAssists : 0,
    }
  }, [apps, goal, assists])

  const beforeDerived = useMemo(() => {
    if (!selectedPlayer) return null
    return calcDerived(selectedPlayer.apps, selectedPlayer.goal, selectedPlayer.assists)
  }, [selectedPlayer])

  const afterDerived = useMemo(() => {
    if (!selectedPlayer) return null
    return calcDerived(parsed.apps, parsed.goal, parsed.assists)
  }, [selectedPlayer, parsed.apps, parsed.goal, parsed.assists])

  const canSave = Boolean(selectedPlayer) && Number.isFinite(parsed.apps) && Number.isFinite(parsed.goal) && Number.isFinite(parsed.assists)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Stats Update</h1>
            <p className="text-muted-foreground">Update Apps/Goals/Assists and see how per-match metrics change.</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/players">Back to Players</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Player</CardTitle>
            <CardDescription>Choose a player to update their totals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedId} onValueChange={(v) => setSelectedId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoading ? "Loading players..." : "Select a player"} />
              </SelectTrigger>
              <SelectContent>
                {players
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {selectedPlayer && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{selectedPlayer.cardType}</Badge>
                <Badge variant="outline">{selectedPlayer.position}</Badge>
                <Badge variant="outline">{selectedPlayer.team === "NAN" ? "Free Agent" : selectedPlayer.team}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Update Totals</CardTitle>
              <CardDescription>Enter new totals (absolute values).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Apps</label>
                  <Input value={apps} onChange={(e) => setApps(e.target.value)} inputMode="numeric" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Goals</label>
                  <Input value={goal} onChange={(e) => setGoal(e.target.value)} inputMode="numeric" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assists</label>
                  <Input value={assists} onChange={(e) => setAssists(e.target.value)} inputMode="numeric" />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  disabled={!canSave}
                  onClick={() => {
                    if (!selectedPlayer) return
                    updatePlayer(selectedPlayer.id, {
                      apps: parsed.apps,
                      goal: parsed.goal,
                      assists: parsed.assists,
                    })
                    setSaved(true)
                  }}
                >
                  Save Update
                </Button>
                {selectedPlayer && (
                  <Button variant="outline" asChild>
                    <Link href={`/players/${selectedPlayer.id}`}>Open Player Page</Link>
                  </Button>
                )}
              </div>

              {saved && <p className="text-sm text-green-600">Saved. Player stats are updated across the site.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Before vs After</CardTitle>
              <CardDescription>See per-match metrics changes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedPlayer || !beforeDerived || !afterDerived ? (
                <p className="text-sm text-muted-foreground">Select a player to preview changes.</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <span className="font-medium">Goals/Match (GPM)</span>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">{beforeDerived.gPm.toFixed(3)} →</div>
                      <div className="font-semibold">
                        <Trend before={beforeDerived.gPm} after={afterDerived.gPm} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <span className="font-medium">Assists/Match (APM)</span>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">{beforeDerived.aPm.toFixed(3)} →</div>
                      <div className="font-semibold">
                        <Trend before={beforeDerived.aPm} after={afterDerived.aPm} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <span className="font-medium">G+A/Match</span>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">{beforeDerived.gAPm.toFixed(3)} →</div>
                      <div className="font-semibold">
                        <Trend before={beforeDerived.gAPm} after={afterDerived.gAPm} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
