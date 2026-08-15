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
  if (apps === 0) return { gPm: 0, aPm: 0, gAPm: 0 }
  return {
    gPm: goal / apps,
    aPm: assists / apps,
    gAPm: (goal + assists) / apps,
  }
}

export default function StatsUpdatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { players, updatePlayer } = usePlayers()
  const [selectedId, setSelectedId] = useState<string>("")
  const [apps, setApps] = useState<string>("")
  const [goal, setGoal] = useState<string>("")
  const [assists, setAssists] = useState<string>("")
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string>("")

  const isLoading = players.length === 0

  // URL-based selection using playerId
  useEffect(() => {
    const playerId = searchParams.get("playerId")
    if (playerId) {
      setSelectedId(playerId)
    }
  }, [searchParams])

  const selectedPlayer = players.find((p) => p.id === Number(selectedId))

  // Set initial values when player is selected
  useEffect(() => {
    if (selectedPlayer) {
      setApps(String(selectedPlayer.apps || 0))
      setGoal(String(selectedPlayer.goal || 0))
      setAssists(String(selectedPlayer.assists || 0))
      setSaved(false)
    }
  }, [selectedPlayer])

  const derived = useMemo(() => {
    const appsNum = Number(apps) || 0
    const goalNum = Number(goal) || 0
    const assistsNum = Number(assists) || 0
    return calcDerived(appsNum, goalNum, assistsNum)
  }, [apps, goal, assists])

  const oldDerived = useMemo(() => {
    if (!selectedPlayer) return { gPm: 0, aPm: 0, gAPm: 0 }
    return calcDerived(selectedPlayer.apps, selectedPlayer.goal, selectedPlayer.assists)
  }, [selectedPlayer])

  const handleSave = async () => {
    if (!selectedPlayer) return
    setIsSaving(true)
    setSaved(false)
    
    try {
      await updatePlayer(selectedPlayer.id, {
        apps: Number(apps),
        goal: Number(goal),
        assists: Number(assists),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error("Failed to update player:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const increment = (setter: (v: string) => void, current: string) => {
    setter(String(Number(current) + 1))
  }

  const decrement = (setter: (v: string) => void, current: string) => {
    setter(String(Math.max(0, Number(current) - 1)))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
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
            <CardDescription >Choose a player to update their totals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Search Player</Label>
              <Input
                placeholder="Search by name or team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={selectedId} onValueChange={(v) => setSelectedId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoading ? "Loading players..." : "Select a player"} />
              </SelectTrigger>
              <SelectContent>
                {players
                  .filter((p) => 
                    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.team?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .slice()
                  .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                  .map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      <div className="flex items-center gap-2">
                        <img 
                          src={p.image || "/placeholder.svg?height=32&width=24&query=football player"} 
                          alt={p.name}
                          className="w-8 h-12 object-cover rounded"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{p.name || 'Unknown Player'}</span>
                          <span className="text-xs text-muted-foreground">{p.team} • {p.position}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {selectedPlayer && (
              <div className="flex items-center gap-4 flex-wrap">
                <img 
                  src={selectedPlayer.image || "/placeholder.svg?height=80&width=60&query=football player"} 
                  alt={selectedPlayer.name}
                  className="w-16 h-24 object-cover rounded-md border"
                />
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{selectedPlayer.cardType}</Badge>
                  <Badge variant="outline">{selectedPlayer.position}</Badge>
                  <Badge variant="outline">{selectedPlayer.team === "NAN" ? "Free Agent" : selectedPlayer.team}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedPlayer && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Update Stats</CardTitle>
              <CardDescription>
                Modify totals and watch per-match metrics update in real-time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Appearances</Label>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" onClick={() => decrement(setApps, apps)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={apps}
                      onChange={(e) => setApps(e.target.value)}
                      className="text-center"
                    />
                    <Button size="icon" variant="outline" onClick={() => increment(setApps, apps)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Goals</Label>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" onClick={() => decrement(setGoal, goal)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className="text-center"
                    />
                    <Button size="icon" variant="outline" onClick={() => increment(setGoal, goal)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Assists</Label>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" onClick={() => decrement(setAssists, assists)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={assists}
                      onChange={(e) => setAssists(e.target.value)}
                      className="text-center"
                    />
                    <Button size="icon" variant="outline" onClick={() => increment(setAssists, assists)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Goals/Match</div>
                  <div className="text-2xl font-bold">
                    {derived.gPm.toFixed(3)}
                    {derived.gPm !== oldDerived.gPm && (
                      <span className={`ml-2 text-sm ${derived.gPm > oldDerived.gPm ? 'text-green-500' : 'text-red-500'}`}>
                        {derived.gPm > oldDerived.gPm ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Assists/Match</div>
                  <div className="text-2xl font-bold">
                    {derived.aPm.toFixed(3)}
                    {derived.aPm !== oldDerived.aPm && (
                      <span className={`ml-2 text-sm ${derived.aPm > oldDerived.aPm ? 'text-green-500' : 'text-red-500'}`}>
                        {derived.aPm > oldDerived.aPm ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">G+A/Match</div>
                  <div className="text-2xl font-bold">
                    {derived.gAPm.toFixed(3)}
                    {derived.gAPm !== oldDerived.gAPm && (
                      <span className={`ml-2 text-sm ${derived.gAPm > oldDerived.gAPm ? 'text-green-500' : 'text-red-500'}`}>
                        {derived.gAPm > oldDerived.gAPm ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : saved ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Saved!
                    </>
                  ) : (
                    "Save Update"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}