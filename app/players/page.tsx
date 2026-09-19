"use client"
const getSortValue = (player: OldPlayer, sortBy: SortKey) => {
  if (sortBy === "overall") {
    return calculatePlayerRating(player)
  }

  if (sortBy === "ovrRating") {
    return (player as any).ovrRating || 0
  }

  if (sortBy === "radarRating") {
    return calculateRadarRating(player)
  }

  return getStatValue(player, sortBy)
}
import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Search, Filter, SortAsc, SortDesc, Grid3X3, List, X, ChevronDown } from "lucide-react"
import { usePlayers, type Player as APIPlayer } from "@/lib/use-players"
import { type Player as OldPlayer } from "@/lib/players-data"
import { adminApi } from "@/lib/api"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Transform API player data to match old Player structure for compatibility
const transformAPIPlayer = (apiPlayer: APIPlayer): OldPlayer => ({
  id: apiPlayer.id,
  name: apiPlayer.name,
  team: apiPlayer.team,
  position: apiPlayer.position,
  age: apiPlayer.age,
  cardType: apiPlayer.cardType,
  apps: apiPlayer.stats.apps,
  goal: apiPlayer.stats.goals,
  assists: apiPlayer.stats.assists,
  gPlusA: apiPlayer.stats.gPlusA,
  gPm: apiPlayer.stats.gPm,
  aPm: apiPlayer.stats.aPm,
  gAPm: apiPlayer.stats.gAPm,
  image: apiPlayer.image,
  ovrRating: apiPlayer.ovrRating
})
import { assignDistinctArchetypes, getPlayerArchetype, PLAYER_ARCHETYPES, getGOATPlayer } from "@/lib/player-archetypes"
import { calculatePlayerRating } from "@/lib/leaderboard-utils"
import { buildLeaderboardBadges, selectBestBadge } from "@/lib/leaderboard-badges"
type SortKey =
  | "name"
  | "goal"
  | "assists"
  |"gPlusA"
  | "gAPm"
  |"gPm"
  |"aPm"
  | "apps"
  | "age"
  |"overall"
  |"ovrRating"
  |"radarRating"

// Helper to get stats from transformed Player (OldPlayer format)
const getStatValue = (player: OldPlayer, key: string) => {
  if (key === 'goal') return player.goal
  if (key === 'assists') return player.assists
  if (key === 'gPlusA') return player.gPlusA
  if (key === 'gAPm') return player.gAPm
  if (key === 'gPm') return player.gPm
  if (key === 'aPm') return player.aPm
  if (key === 'apps') return player.apps
  if (key === 'ovrRating') return (player as any).ovrRating || 0
  return (player as any)[key]
}

const formatPlayerName = (name: string) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Enhanced efficiency rating with weighted metrics (from compare page - EXACT SAME FORMULA)
const calculateEfficiencyRating = (player: OldPlayer) => {
  // Weighted metrics (sum should be 1.0)
  const weights = {
    attacking: 0.35,  // Goals per match and total goals
    playmaking: 0.3,  // Assists per match and total assists
    consistency: 0.15, // Appearances and consistency
    efficiency: 0.2   // Overall efficiency (goals + assists per match)
  };

  // Calculate base metrics (0-100 scale)
  const metrics = {
    attacking: Math.min((player.gPm || 0) * 150, 100), // More weight on goal scoring
    playmaking: Math.min((player.aPm || 0) * 200, 100), // More weight on assists
    consistency: player.apps > 0
      ? Math.min((player.goal + player.assists) / player.apps * 10, 100)
      : 0, // Based on goals + assists per appearance
    efficiency: Math.min(((player.gAPm || 0) * 100) / 1.5, 100) // Normalized efficiency
  };

  // Calculate weighted overall
  const overall = (
    metrics.attacking * weights.attacking +
    metrics.playmaking * weights.playmaking +
    metrics.consistency * weights.consistency +
    metrics.efficiency * weights.efficiency
  );

  return {
    ...metrics,
    overall: Math.min(overall, 100)
  };
}

// Performance category calculation (from compare page - EXACT SAME FORMULA)
const getPerformanceCategory = (player: OldPlayer) => {
  // Calculate shots per match if available, otherwise use a default
  const shotsPerMatch = 1 // Default since we don't have shots data
  const conversionRate = shotsPerMatch > 0 ? player.goal / (shotsPerMatch * player.apps) : 0

  return {
    // Attacking: Goals per match (70%) and conversion rate (30%)
    attacking: player.apps > 0
      ? ((player.gPm || 0) * 150 * 0.7) + (conversionRate * 100 * 0.3)
      : 0,

    // Playmaking: Assists per match (100% for now, can be enhanced with more data)
    playmaking: player.apps > 0
      ? (player.aPm || 0) * 200
      : 0,

    // Efficiency: Goals + assists per match (100%)
    efficiency: player.apps > 0
      ? (player.gAPm || 0) * 100
      : 0,

    // Experience: Based on appearances with diminishing returns
    experience: Math.min(Math.log(player.apps + 1) * 20, 100),

    // Consistency: Based on goals + assists per appearance
    consistency: player.apps > 0
      ? Math.min((player.goal + player.assists) / player.apps * 100, 100)
      : 0
  };
}

// Calculate radar rating (from compare page - EXACT SAME FORMULA)
const calculateRadarRating = (player: OldPlayer) => {
  const categories = getPerformanceCategory(player)
  const efficiencyRating = calculateEfficiencyRating(player)

  const radarData = [
    { value: Math.min(categories.attacking, 100) },
    { value: Math.min(categories.playmaking, 100) },
    { value: Math.min(efficiencyRating.efficiency, 100) },
    { value: Math.min(categories.consistency || 0, 100) },
    { value: Math.min(categories.experience, 100) },
    { value: Math.min(efficiencyRating.overall, 100) },
  ]

  return radarData.reduce((sum, item) => sum + item.value, 0) / radarData.length
}
//overall

export default function PlayersPage() {
  const searchParams = useSearchParams()
  const { players: playersData } = usePlayers()
  const [searchTerm, setSearchTerm] = useState("")
  
  // Transform API data to old format for compatibility with existing functions
  const transformedPlayers = useMemo(() => playersData.map(transformAPIPlayer), [playersData])
  
  // Get team from URL parameter
  const initialTeam = searchParams?.get('team') || "all"
  const [selectedPosition, setSelectedPosition] = useState<string>("all")
  const [selectedCardType, setSelectedCardType] = useState<string>("all")
  const [selectedTeam, setSelectedTeam] = useState<string>(initialTeam)
  const [selectedArchetype, setSelectedArchetype] = useState<string>("all")
  const [ageRange, setAgeRange] = useState([0, 100])
  const [goalsRange, setGoalsRange] = useState([0, 5000])
  const [assistsRange, setAssistsRange] = useState([0, 5000])
  const [gPlusARange, setGPlusARange] = useState([0, 10000])
  const [appsRange, setAppsRange] = useState([0, 10000])
  // const [sortBy, setSortBy] = useState<keyof Player>("name") //change
  const [sortBy, setSortBy] = useState<SortKey>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Auto-set sort order based on sort type
  const handleSortChange = (value: string) => {
    const sortKey = value as SortKey
    setSortBy(sortKey)
    // Default to descending for radar rating (higher is better)
    if (sortKey === "radarRating" || sortKey === "overall" || sortKey === "ovrRating") {
      setSortOrder("desc")
    } else {
      setSortOrder("asc")
    }
  }
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [playerToDelete, setPlayerToDelete] = useState<OldPlayer | null>(null)
  
  // Update selectedTeam when URL parameter changes
  useEffect(() => {
    const team = searchParams?.get('team')
    if (team) {
      setSelectedTeam(team)
    }
  }, [searchParams])

  const positions = [...new Set(playersData.map((p) => p.position))].sort()
  const cardTypes = [...new Set(playersData.map((p) => p.cardType))].sort()
  const teams = [...new Set(playersData.map((p) => p.team).filter((team) => team !== "NAN"))].sort()

  const goatPlayer = useMemo(() => getGOATPlayer(transformedPlayers), [transformedPlayers])
  const leaderboardBadgesByPlayerId = useMemo(() => buildLeaderboardBadges(transformedPlayers, 10), [transformedPlayers])
  const archetypeAssignments = useMemo(() => assignDistinctArchetypes(transformedPlayers), [transformedPlayers])
  const availableArchetypes = useMemo(() => {
    const uniqueByName = new Map<string, (typeof PLAYER_ARCHETYPES)[keyof typeof PLAYER_ARCHETYPES]>()
    archetypeAssignments.forEach((archetype) => {
      if (archetype.name && !uniqueByName.has(archetype.name)) {
        uniqueByName.set(archetype.name, archetype)
      }
    })
    return Array.from(uniqueByName.values())
  }, [archetypeAssignments])

  const filteredAndSortedPlayers = useMemo(() => {
  const filtered = transformedPlayers.filter((player) => {
    const archetype = getPlayerArchetype(player, goatPlayer, archetypeAssignments)

    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.cardType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (archetype.name ? archetype.name.toLowerCase().includes(searchTerm.toLowerCase()) : false)

    return (
      matchesSearch &&
      (selectedPosition === "all" || player.position === selectedPosition) &&
      (selectedCardType === "all" || player.cardType === selectedCardType) &&
      (selectedTeam === "all" || player.team.toLowerCase() === selectedTeam.toLowerCase()) &&
      (selectedArchetype === "all" || !archetype.name || archetype.name === selectedArchetype) &&
      player.age >= ageRange[0] &&
      player.age <= ageRange[1] &&
      player.goal >= goalsRange[0] &&
      player.goal <= goalsRange[1] &&
      player.assists >= assistsRange[0] &&
      player.assists <= assistsRange[1] &&
      player.gPlusA >= gPlusARange[0] &&
      player.gPlusA <= gPlusARange[1] &&
      player.apps >= appsRange[0] &&
      player.apps <= appsRange[1]
    )
  })

  return [...filtered].sort((a, b) => {
  const aRaw = getSortValue(a, sortBy)
  const bRaw = getSortValue(b, sortBy)

  if (aRaw == null && bRaw == null) return 0
  if (aRaw == null) return sortOrder === "asc" ? 1 : -1
  if (bRaw == null) return sortOrder === "asc" ? -1 : 1

  if (typeof aRaw === "string" && typeof bRaw === "string") {
    return sortOrder === "asc"
      ? aRaw.localeCompare(bRaw)
      : bRaw.localeCompare(aRaw)
  }

  return sortOrder === "asc"
    ? Number(aRaw) - Number(bRaw)
    : Number(bRaw) - Number(aRaw)
})

}, [
  transformedPlayers,
  searchTerm,
  selectedPosition,
  selectedCardType,
  selectedTeam,
  selectedArchetype,
  ageRange,
  goalsRange,
  assistsRange,
  gPlusARange,
  appsRange,
  sortBy,
  sortOrder,
  goatPlayer,
  archetypeAssignments,
])

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedPosition("all")
    setSelectedCardType("all")
    setSelectedTeam("all")
    setSelectedArchetype("all")
    setAgeRange([0, 100])
    setGoalsRange([0, 5000])
    setAssistsRange([0, 5000])
    setGPlusARange([0, 10000])
    setAppsRange([0, 10000])
    setSortBy("name")
    setSortOrder("asc")
  }

  const handlePasswordSubmit = async () => {
    if (deletePassword === "donotbeoversmart") { // You can change this password
      try {
        await adminApi.deletePlayer(playerToDelete!.id)
        deletePlayer(playerToDelete!.id)
        toast.success('Player deleted successfully')
        setShowPasswordDialog(false)
        setPlayerToDelete(null)
        setDeletePassword("")
      } catch (error) {
        console.error('Error deleting player:', error)
        toast.error('Failed to delete player')
      }
    } else {
      toast.error('Incorrect password')
    }
  }

  const activeFiltersCount = [
    searchTerm !== "",
    selectedPosition !== "all",
    selectedCardType !== "all",
    selectedTeam !== "all",
    selectedArchetype !== "all",
    ageRange[0] !== 0 || ageRange[1] !== 100,
    goalsRange[0] !== 0 || goalsRange[1] !== 5000,
    assistsRange[0] !== 0 || assistsRange[1] !== 5000,
    gPlusARange[0] !== 0 || gPlusARange[1] !== 10000,
    appsRange[0] !== 0 || appsRange[1] !== 10000,
  ].filter(Boolean).length

  const PlayerCard = ({ player }: { player: OldPlayer }) => {
    const archetype = getPlayerArchetype(player, goatPlayer, archetypeAssignments)
    const bestLeaderboardBadge = selectBestBadge(leaderboardBadgesByPlayerId.get(player.id) ?? [])
    const { deletePlayer } = usePlayers()

    const handleDelete = () => {
      if (confirm(`Are you sure you want to delete ${formatPlayerName(player.name)}?`)) {
        setPlayerToDelete(player)
        setShowPasswordDialog(true)
        setDeletePassword("")
      }
    }

    return (
      <Card
        key={player.id}
        className={`hover:shadow-lg transition-shadow ${
          goatPlayer && player.id === goatPlayer.id ? "border-2 border-amber-500 bg-amber-50 dark:bg-amber-950" : ""
        }`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={player.image || "/placeholder.svg?height=64&width=64&query=football player"}
                alt={player.name}
                className="w-40 h-56 rounded-none object-cover"
              />
              {(player as any).ovrRating && (
                <div className="absolute top-2 left-2 bg-[#ffff33] text-black font-bold px-2 py-1 rounded"
                     style={{ 
                       fontFamily: '"Courier New", monospace',
                       textTransform: 'uppercase',
                       letterSpacing: '1px',
                       fontSize: '14px',
                       fontWeight: '900'
                     }}>
                  {(player as any).ovrRating}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{formatPlayerName(player.name)}</CardTitle>
                {goatPlayer && player.id === goatPlayer.id && (
                  <Badge className="bg-amber-200 text-amber-900 border border-amber-500 font-bold">🐐 GOAT</Badge>
                )}
              </div>
              <CardDescription className="text-sm">
                {player.position} • {player.team === "NAN" ? "Free Agent" : formatPlayerName(player.team)}
              </CardDescription>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {archetype.name && (
                  <div className="flex-shrink-0 flex items-center gap-1">
                    <span className="text-lg">{archetype.emoji}</span>
                    <Badge className={`text-xs font-bold whitespace-nowrap ${archetype.badge}`}>
                      {archetype.name}
                    </Badge>
                  </div>
                )}
                {bestLeaderboardBadge && (
                  <div className="flex-shrink-0">
                    <Badge variant="secondary" className="text-xs font-bold whitespace-nowrap">
                      {bestLeaderboardBadge.emoji} #{bestLeaderboardBadge.rank} {bestLeaderboardBadge.label}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="text-sm font-bold px-3 py-1">
              {player.cardType}
            </Badge>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Goals • Assists • G+A</div>
              <div className="font-bold">
                {player.goal} • {player.assists} • {player.gPlusA}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
            <div>
              <span className="text-muted-foreground">Apps:</span>
              <span className="font-semibold ml-1">{player.apps}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Age:</span>
              <span className="font-semibold ml-1">{player.age}</span>
            </div>
            <div>
              <span className="text-muted-foreground">G/Match:</span>
              <span className="font-semibold ml-1">{player.gPm.toFixed(3)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">A/Match:</span>
              <span className="font-semibold ml-1">{player.aPm.toFixed(3)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">G+A/Match:</span>
              <span className="font-semibold ml-1">{player.gAPm.toFixed(3)}</span>
            </div>
          </div>
          {/* <div className="flex gap-2">
            <Button className="flex-1 bg-transparent" variant="outline" asChild>
              <Link href={`/players/${player.id}`}>View Details</Link>
            </Button>
            <Button className="flex-1" asChild>
              <Link href="/compare">Compare</Link>
            </Button>
          </div> */}
          <div className="flex gap-2">
          <Button className="flex-1 bg-transparent" variant="outline" asChild>
            <Link href={`/players/${player.id}`}>View Details</Link>
          </Button>
          <Button className="flex-1" asChild>
             <Link href={`/compare?playerId=${player.id}`}>Compare</Link>
          </Button>
          <Button
            className="bg-red-500 hover:bg-red-600 text-white"
            size="icon"
            onClick={handleDelete}
            title="Delete Player"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        </CardContent>
      </Card>
    )
  }

  const PlayerListItem = ({ player }: { player: OldPlayer }) => {
    const archetype = getPlayerArchetype(player, goatPlayer, archetypeAssignments)
    const bestLeaderboardBadge = selectBestBadge(leaderboardBadgesByPlayerId.get(player.id) ?? [])
    const { deletePlayer } = usePlayers()

    const handleDelete = () => {
      if (confirm(`Are you sure you want to delete ${formatPlayerName(player.name)}?`)) {
        setPlayerToDelete(player)
        setShowPasswordDialog(true)
        setDeletePassword("")
      }
    }

    return (
      <Card
        key={player.id}
        className={`hover:shadow-md transition-shadow ${
          goatPlayer && player.id === goatPlayer.id ? "border-2 border-amber-500 bg-amber-50 dark:bg-amber-950" : ""
        }`}
      >
        <CardContent className="p-3 sm:p-4">
          {/* Mobile View */}
          <div className="md:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={player.image || "/placeholder.svg?height=48&width=48&query=football player"}
                    alt={player.name}
                    className="w-16 h-24 rounded-sm object-cover"
                  />
                  {(player as any).ovrRating && (
                    <div className="absolute top-1 left-1 bg-[#ffff33] text-black font-bold px-1 py-0.5 rounded text-xs"
                         style={{ 
                           fontFamily: '"Courier New", monospace',
                           textTransform: 'uppercase',
                           letterSpacing: '0.5px',
                           fontWeight: '900'
                         }}>
                      {(player as any).ovrRating}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="font-semibold text-sm sm:text-base">{formatPlayerName(player.name)}</h3>
                    {goatPlayer && player.id === goatPlayer.id && (
                      <Badge className="bg-amber-200 text-amber-900 border border-amber-500 font-bold text-[10px] px-1 h-4">
                        🐐
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {player.position} • {player.team === "NAN" ? "Free Agent" : formatPlayerName(player.team)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-center px-1">
                  <div className="font-bold text-sm">{player.goal}</div>
                  <div className="text-[10px] text-muted-foreground">G</div>
                </div>
                <div className="text-center px-1">
                  <div className="font-bold text-sm">{player.assists}</div>
                  <div className="text-[10px] text-muted-foreground">A</div>
                </div>
                <div className="text-center px-1">
                  <div className="font-bold text-sm">{player.gPlusA}</div>
                  <div className="text-[10px] text-muted-foreground">G+A</div>
                </div>
                <div className="text-center px-1">
                  <div className="font-bold text-sm">{player.gAPm.toFixed(3)}</div>
                  <div className="text-[10px] text-muted-foreground">G+A/M</div>
                </div>
                <div className="flex flex-col ml-2 space-y-1">
                  <div className="text-xs text-muted-foreground">
                    G+A: {player.gPlusA} | G+A/M: {player.gAPm.toFixed(3)}
                  </div>
                  <Button size="sm" variant="outline" className="h-6 w-14 text-xs p-0" asChild>
                    <Link href={`/players/${player.id}`}>View</Link>
                  </Button>
                  <Button size="sm" className="h-6 w-14 text-xs p-0" asChild>
                    <Link href={`/compare?playerId=${player.id}`}>Compare</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={player.image || "/placeholder.svg?height=48&width=48&query=football player"}
                    alt={player.name}
                    className="w-40 h-56 rounded-none object-cover"
                  />
                  {(player as any).ovrRating && (
                    <div className="absolute top-2 left-2 bg-[#ffff33] text-black font-bold px-2 py-1 rounded"
                         style={{ 
                           fontFamily: '"Courier New", monospace',
                           textTransform: 'uppercase',
                           letterSpacing: '1px',
                           fontSize: '14px',
                           fontWeight: '900'
                         }}>
                      {(player as any).ovrRating}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{formatPlayerName(player.name)}</h3>
                    {goatPlayer && player.id === goatPlayer.id && (
                      <Badge className="bg-amber-200 text-amber-900 border border-amber-500 font-bold text-xs">
                        🐐 GOAT
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {player.position} • {player.team === "NAN" ? "Free Agent" : formatPlayerName(player.team)} • Age{" "}
                    {player.age}
                  </p>
                  <div className="mt-1 flex items-center gap-1">
                    {archetype.name && (
                      <>
                        <span className="text-sm">{archetype.emoji}</span>
                        <span className="text-xs font-medium text-muted-foreground">{archetype.name}</span>
                      </>
                    )}
                    {bestLeaderboardBadge && (
                      <Badge variant="secondary" className="text-xs font-bold ml-2">
                        {bestLeaderboardBadge.emoji} #{bestLeaderboardBadge.rank} {bestLeaderboardBadge.label}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <Badge variant="secondary" className="font-bold">
                  {player.cardType}
                </Badge>
                <div className="text-center">
                  <div className="font-bold">{player.goal}</div>
                  <div className="text-xs text-muted-foreground">Goals</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">{player.assists}</div>
                  <div className="text-xs text-muted-foreground">Assists</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">{player.gPlusA}</div>
                  <div className="text-xs text-muted-foreground">G+A</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">{player.gAPm.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground">G+A/Match</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">{player.gPm.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground">G/Match</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">{player.aPm.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground">A/Match</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/players/${player.id}`}>Details</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href={`/compare?playerId=${player.id}`}>Compare</Link>
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white"
                    onClick={handleDelete}
                    title="Delete Player"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">eFootball Player Database</h1>
          <p className="text-muted-foreground text-lg">
            Search, filter, and explore our comprehensive database of eFootball player cards.
          </p>
        </div>

        {/* Search and Controls */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players by name, team, position, archetype, or card type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 text-base"
            />
          </div>

          {/* Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>

              {activeFiltersCount > 0 && (
                <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Clear Filters
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sort by:</span>
                <Select
  value={sortBy}
  onValueChange={(value: string) => handleSortChange(value as SortKey)}
>
  {/* change */}

                {/*change <Select value={sortBy} onValueChange={(value) => setSortBy(value as keyof Player)}> */}
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="goal">Goals</SelectItem>
                    <SelectItem value="assists">Assists</SelectItem>
                    <SelectItem value="gPlusA">G+A </SelectItem>
                    <SelectItem value="gAPm">G+A per Match</SelectItem>
                    <SelectItem value="gPm">G per Match</SelectItem>
                    <SelectItem value="aPm">A per Match</SelectItem>
                    <SelectItem value="apps">Appearances</SelectItem>
                    <SelectItem value="age">Age</SelectItem>
                    <SelectItem value="ovrRating">In-Game OVR</SelectItem>
                    <SelectItem value="radarRating">Radar Rating</SelectItem>
                    <SelectItem value="overall">OVR</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                  {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
              </div>

              <div className="flex items-center gap-1 border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Player Archetype</label>
                  <Select value={selectedArchetype} onValueChange={setSelectedArchetype}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Archetypes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Archetypes</SelectItem>
                      {availableArchetypes.map((archetype) => (
                        <SelectItem key={archetype.name} value={archetype.name}>
                          {archetype.emoji} {archetype.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Position</label>
                  <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                    <SelectTrigger>
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
                    <SelectTrigger>
                      <SelectValue placeholder="All Card Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Card Types</SelectItem>
                      {cardTypes.map((cardType) => (
                        <SelectItem key={cardType} value={cardType}>
                          {cardType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Team</label>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Teams" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Teams</SelectItem>
                      {teams.map((team) => (
                        <SelectItem key={team} value={team}>
                          {formatPlayerName(team)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Age Range: {ageRange[0]} - {ageRange[1]} years
                  </label>
                  <Slider value={ageRange} onValueChange={setAgeRange} min={0} max={100} step={1} className="w-full" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Goals Range: {goalsRange[0]} - {goalsRange[1]}
                  </label>
                  <Slider
                    value={goalsRange}
                    onValueChange={setGoalsRange}
                    min={0}
                    max={5000}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Assists Range: {assistsRange[0]} - {assistsRange[1]}
                  </label>
                  <Slider
                    value={assistsRange}
                    onValueChange={setAssistsRange}
                    min={0}
                    max={5000}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    G+A Range: {gPlusARange[0]} - {gPlusARange[1]}
                  </label>
                  <Slider
                    value={gPlusARange}
                    onValueChange={setGPlusARange}
                    min={0}
                    max={10000}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Matches Played Range: {appsRange[0]} - {appsRange[1]}
                  </label>
                  <Slider
                    value={appsRange}
                    onValueChange={setAppsRange}
                    min={0}
                    max={10000}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredAndSortedPlayers.length} of {playersData.length} players
          </p>
        </div>

        {/* Players Display */}
        {filteredAndSortedPlayers.length > 0 ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredAndSortedPlayers.map((player) =>
              viewMode === "grid" ? (
                <PlayerCard key={player.id} player={player} />
              ) : (
                <PlayerListItem key={player.id} player={player} />
              ),
            )}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-muted-foreground">
                <Search className="w-24 h-34 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Players Found</h3>
                <p>Try adjusting your search criteria or filters to find players.</p>
                <Button className="mt-4" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Password Dialog for Delete */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Password to Delete Player</DialogTitle>
              <DialogDescription>
                Please enter the password to delete {playerToDelete ? formatPlayerName(playerToDelete.name) : 'this player'}.
              </DialogDescription>
            </DialogHeader>
            <Input
              type="password"
              placeholder="Enter password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePasswordSubmit()
                }
              }}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handlePasswordSubmit}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
