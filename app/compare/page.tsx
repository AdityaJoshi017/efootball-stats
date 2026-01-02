"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Search, Plus, X, Users, Trophy, Target, Zap, BarChart3, Download, Sparkles, Filter, Lightbulb } from "lucide-react"
import { usePlayers, type Player } from "@/lib/use-players"
// import { playersData, type Player } from "@/lib/players-data"
const PRESETS = [
  {
    id: 'messi-evolution',
    name: 'Messi Evolution',
    playerIds: [1, 2, 3, 4], // Different Messi cards
    playerNames: [
      "Lionel Messi (1)",
      "Lionel Messi (2)",
      "Lionel Messi (3)",
      "Lionel Messi (4)"
    ]
  },
  {
    id: 'neymar-evolution',
    name: 'Neymar Evolution',
    playerIds: [8, 26, 40, 47], // Different Neymar cards
    playerNames: [
      "Neymar Jr (8)",
      "Neymar Jr (26)",
      "Neymar Jr (40)",
      "Neymar Jr (47)"
    ]
  },
  {
    id: 'mbappe-evolution',
    name: 'Mbappé Evolution',
    playerIds: [18, 19, 20, 21], // Different Mbappé cards
    playerNames: [
      "Kylian Mbappé (18)",
      "Kylian Mbappé (19)",
      "Kylian Mbappé (20)",
      "Kylian Mbappé (21)"
    ]
  },
  // {
  //   id: 'epic-cfs',
  //   name: 'Epic CFs (Legends)',
  //   playerNames: [
  //     "Gabriel Batistuta",
  //     "Fernando Torres",
  //     "Ruud van Nistelrooy",
  //     "David Villa"
  //   ]
  // },
  {
    id: 'epic-cfs',
    name: 'Epic CFs (Legends)',
    playerIds: [6, 7, 11, 51], // example IDs — must exist in players[]
  },
  // {
  //   id: 'best-playmakers',
  //   name: 'Best Playmakers',
  //   playerIds: [4, 8, 12, 42], // Updated to match actual player IDs: Messi(1), KDB(4), Bruno(5), Neymar(8)
  //   playerNames: [
  //     "Lionel Messi",
  //     "Neymar Jr",
  //     "Johan Cruyff",
  //     "Kevin de Bruyne"
  //   ]
  // }
   {
    id: 'best-playmakers',
    name: 'Best Playmakers',
    playerIds: [4, 8, 12, 42],
  },
  {
    id: 'Top Wingers',
    name: 'Top Wingers',
    playerIds: [3, 16, 40, 45],
  },
  {
    id: 'elite-players',
    name: 'Elite Players',
    playerIds: [29, 18, 25, 44],
  },
  {
    id: 'barcelona-best',
    name: 'Barcelona Best',
    team: 'Barcelona',
    limit: 4,
    sortBy: 'gAPm' as const,
    sortOrder: 'desc' as const
  },
  {
    id: 'man-city-best',
    name: 'Man City Best',
    team: 'Man City',
    limit: 4,
    sortBy: 'gAPm' as const,
    sortOrder: 'desc' as const
  },
  {
    id: 'real-madrid-best',
    name: 'Real Madrid Best',
    team: 'Real Madrid',
    limit: 4,
    sortBy: 'gAPm' as const,
    sortOrder: 'desc' as const
  },
  {
    id: 'psg-best',
    name: 'PSG Best',
    team: 'Psg',
    limit: 4,
    sortBy: 'gAPm' as const,
    sortOrder: 'desc' as const
  },
 
];
export default function ComparePage() {
  const searchParams = useSearchParams()
  const { players: playersData } = usePlayers()
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [positionFilter, setPositionFilter] = useState<string>("")
  const [teamFilter, setTeamFilter] = useState<string>("")
  const [cardTypeFilter, setCardTypeFilter] = useState<string>("")
  const urlPlayerProcessed = useRef(false)

  // Add player from URL parameter if present
  useEffect(() => {
    const playerId = searchParams?.get('playerId')
    if (playerId && playersData.length > 0 && !urlPlayerProcessed.current) {
      const playerToAdd = playersData.find(p => p.id.toString() === playerId)
      if (playerToAdd && !selectedPlayers.some(p => p.id === playerToAdd.id)) {
        console.log('Auto-adding player from URL:', playerToAdd.name)
        setSelectedPlayers(prev => [...prev, playerToAdd])
        urlPlayerProcessed.current = true
      }
    }
  }, [searchParams, playersData, selectedPlayers])

  // Function to load a preset
  type Preset = {
    id: string;
    name: string;
    playerIds?: number[];
    playerNames?: string[];
    team?: string;
    limit?: number;
    sortBy?: keyof Player;
    sortOrder?: 'asc' | 'desc';
  };

  const loadPreset = (preset: Preset) => {
    let playersToAdd: Player[] = [];
    
    // Helper function to check if a player is already selected (by name)
    const isPlayerSelected = (player: Player) => {
      return selectedPlayers.some(selected => 
        selected.name.toLowerCase() === player.name.toLowerCase()
      );
    };
    
    if (preset.team) {
      // Handle team-based presets - filter out already selected players by name
      playersToAdd = playersData
        .filter(p => 
          p.team.toLowerCase() === preset.team?.toLowerCase() &&
          !isPlayerSelected(p)
        )
        .sort((a, b) => {
          if (!preset.sortBy) return 0;
          const aValue = a[preset.sortBy as keyof Player] as number;
          const bValue = b[preset.sortBy as keyof Player] as number;
          return preset.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        })
        .slice(0, preset.limit || 4);
    } 
    else if (preset.playerIds) {
      // Handle preset with specific player IDs - filter out already selected players by name
      playersToAdd = playersData.filter(p => 
        preset.playerIds?.includes(p.id) &&
        !isPlayerSelected(p)
      );
    } 
    else if (preset.playerNames) {
      // Fallback to name matching - filter out already selected players by name
      playersToAdd = playersData.filter(p => 
        preset.playerNames?.some(name => 
          p.name.toLowerCase().includes(name.toLowerCase())
        ) &&
        !isPlayerSelected(p)
      );
    }
    
    // Update display names for specific players if needed
    if (preset.playerNames && preset.playerIds) {
      playersToAdd = playersToAdd.map((player, index) => ({
        ...player,
        name: preset.playerNames?.[index] || player.name
      }));
    }
    
    console.log('Loading preset. Found players:', playersToAdd);
    setSelectedPlayers(playersToAdd.slice(0, 4));
    setIsDialogOpen(false);
  };

  const filteredPlayers = playersData.filter(
    (player) =>
      (player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.position.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!positionFilter || player.position === positionFilter) &&
      (!teamFilter || player.team.toLowerCase() === teamFilter.toLowerCase()) &&
      (!cardTypeFilter || player.cardType.toLowerCase() === cardTypeFilter.toLowerCase())
  )

  const getTeamStats = (teamName: string) => {
    const teamPlayers = playersData.filter((p) => p.team.toLowerCase() === teamName.toLowerCase())
    if (teamPlayers.length === 0) return null

    return {
      team: teamName,
      playerCount: teamPlayers.length,
      totalGoals: teamPlayers.reduce((sum, p) => sum + p.goal, 0),
      totalAssists: teamPlayers.reduce((sum, p) => sum + p.assists, 0),
      avgGPm: teamPlayers.reduce((sum, p) => sum + p.gPm, 0) / teamPlayers.length,
      avgAPm: teamPlayers.reduce((sum, p) => sum + p.aPm, 0) / teamPlayers.length,
      avgAge: Math.round(teamPlayers.reduce((sum, p) => sum + p.age, 0) / teamPlayers.length),
    }
  }
  
  const getPositionStats = (position: string) => {
    const posPlayers = playersData.filter((p) => p.position === position)
    if (posPlayers.length === 0) return null

    return {
      position,
      playerCount: posPlayers.length,
      avgGoals: (posPlayers.reduce((sum, p) => sum + p.goal, 0) / posPlayers.length).toFixed(1),
      avgAssists: (posPlayers.reduce((sum, p) => sum + p.assists, 0) / posPlayers.length).toFixed(1),
      avgGPm: (posPlayers.reduce((sum, p) => sum + p.gPm, 0) / posPlayers.length).toFixed(3),
      avgAPm: (posPlayers.reduce((sum, p) => sum + p.aPm, 0) / posPlayers.length).toFixed(3),
      topPlayer: posPlayers.reduce((top, p) => (p.gAPm > top.gAPm ? p : top)),
    }
  }

  const addPlayer = (player: Player) => {
    console.log('Adding player:', player.name, 'Current selected:', selectedPlayers.length);
    
    // Check if player is already selected
    if (selectedPlayers.find((p) => p.id === player.id)) {
      console.log('Player already selected');
      return;
    }
    
    // Check if we have reached the limit
    if (selectedPlayers.length >= 4) {
      console.log('Maximum players reached');
      return;
    }
    
    // Add the player
    setSelectedPlayers(prev => {
      const updated = [...prev, player];
      console.log('Updated selected players:', updated.length);
      return updated;
    });
    
    // Show feedback
    // alert(`${player.name} added to comparison!`);
    
    // Close dialog and reset search
    setIsDialogOpen(false);
    setSearchTerm("");
    setPositionFilter("");
    setTeamFilter("");
    setCardTypeFilter("");
  }

  const removePlayer = (playerId: number) => {
    console.log('removePlayer called with ID:', playerId);
    console.log('Current selected players:', selectedPlayers.map(p => ({ id: p.id, name: p.name })));
    const filtered = selectedPlayers.filter((p) => p.id !== playerId);
    console.log('After filter:', filtered.map(p => ({ id: p.id, name: p.name })));
    setSelectedPlayers(filtered);
  }

  const findSimilarPlayers = (player: Player, limit = 3) => {
    const calculateDistance = (p1: Player, p2: Player) => {
      const weights = {
        gPm: 0.3,
        aPm: 0.3,
        gAPm: 0.2,
        age: 0.1,
        apps: 0.1,
      }
      const distance =
        Math.abs(p1.gPm - p2.gPm) * weights.gPm +
        Math.abs(p1.aPm - p2.aPm) * weights.aPm +
        Math.abs(p1.gAPm - p2.gAPm) * weights.gAPm +
        Math.abs(p1.age - p2.age) * weights.age +
        Math.abs((p1.apps - p2.apps) / 1000) * weights.apps
      return distance
    }

    return playersData
      .filter((p) => p.id !== player.id && !selectedPlayers.find((sp) => sp.id === p.id))
      .map((p) => ({ player: p, distance: calculateDistance(player, p) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map((item) => item.player)
  }

  // Enhanced efficiency rating with weighted metrics
  const calculateEfficiencyRating = (player: Player) => {
    // Weighted metrics (sum should be 1.0)
    const weights = {
      attacking: 0.35,  // Goals per match and total goals
      playmaking: 0.3,  // Assists per match and total assists
      consistency: 0.15, // Appearances and consistency
      efficiency: 0.2   // Overall efficiency (goals + assists per match)
    };

    // Calculate base metrics (0-100 scale)
    const metrics = {
      attacking: Math.min(player.gPm * 150, 100), // More weight on goal scoring
      playmaking: Math.min(player.aPm * 200, 100), // More weight on assists
      consistency: player.apps > 0 
        ? Math.min((player.goal + player.assists) / player.apps * 10, 100)
        : 0, // Based on goals + assists per appearance
      efficiency: Math.min((player.gAPm * 100) / 1.5, 100) // Normalized efficiency
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

  // const getStatColor = (stat: number, category: string) => {
  //   if (category === "gPm" || category === "aPm" || category === "gAPm") {
  //     if (stat >= 0.8) return "text-green-600 bg-green-50"
  //     if (stat >= 0.5) return "text-blue-600 bg-blue-50"
  //     if (stat >= 0.3) return "text-yellow-600 bg-yellow-50"
  //     // return "text-black-foreground bg-gray-50"
  //      return "text-red-600 bg-gray-100"
  //   }
  //   if (stat >= 200) return "text-green-600 bg-green-50"
  //   if (stat >= 100) return "text-blue-600 bg-blue-50"
  //   if (stat >= 50) return "text-yellow-600 bg-yellow-50"
  //   // return "text-black-foreground bg-gray-50"
  //    return "text-blue-600 bg-gray-100"
  // }
   const getStatColor = (stat: number, category: string) => {
  const isRateStat = category === "gPm" || category === "aPm" || category === "gAPm"

  if (isRateStat) {
    if (stat >= 0.8)
      return "text-green-600 bg-green-50 ring-1 ring-green-400/50 shadow-[0_0_8px_rgba(34,197,94,0.35)]"

    if (stat >= 0.5)
      return "text-blue-600 bg-blue-50 ring-1 ring-blue-400/50 shadow-[0_0_8px_rgba(59,130,246,0.35)]"

    if (stat >= 0.3)
      return "text-yellow-600 bg-yellow-50 ring-1 ring-yellow-400/50 shadow-[0_0_8px_rgba(234,179,8,0.35)]"

    // 🔴 Low → red glow on grey bg
    return "text-red-600 bg-red-100 ring-1 ring-red-400/50 shadow-[0_0_8px_rgba(239,68,68,0.35)]"
  }

  // Volume stats (no red rule)
  if (stat >= 200)
    return "text-green-600 bg-green-50 ring-1 ring-green-400/40 shadow-[0_0_6px_rgba(34,197,94,0.3)]"

  if (stat >= 100)
    return "text-blue-600 bg-blue-50 ring-1 ring-blue-400/40 shadow-[0_0_6px_rgba(59,130,246,0.3)]"

  if (stat >= 50)
    return "text-yellow-600 bg-yellow-50 ring-1 ring-yellow-400/40 shadow-[0_0_6px_rgba(234,179,8,0.3)]"

  return "text-foreground bg-gray-400 ring-1 ring-gray-400/50 shadow-[0_0_6px_rgba(234,179,8,0.3)]"
}


  const formatPlayerName = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getPerformanceCategory = (player: Player) => {
    // Calculate shots per match if available, otherwise use a default
    const shotsPerMatch = 'shots' in player ? (player as any).shots / Math.max(1, player.apps) : 1;
    const conversionRate = shotsPerMatch > 0 ? player.goal / (shotsPerMatch * player.apps) : 0;
    
    return {
      // Attacking: Goals per match (70%) and conversion rate (30%)
      attacking: player.apps > 0 
        ? (player.gPm * 150 * 0.7) + (conversionRate * 100 * 0.3)
        : 0,
      
      // Playmaking: Assists per match (100% for now, can be enhanced with more data)
      playmaking: player.apps > 0
        ? player.aPm * 200
        : 0,
      
      // Efficiency: Goals + assists per match (100%)
      efficiency: player.apps > 0
        ? player.gAPm * 100
        : 0,
      
      // Experience: Based on appearances with diminishing returns
      experience: Math.min(Math.log(player.apps + 1) * 20, 100),
      
      // Consistency: Based on goals + assists per appearance
      consistency: player.apps > 0 
        ? Math.min((player.goal + player.assists) / player.apps * 100, 100)
        : 0
    };
  }

  const getHeadToHeadWinner = (players: Player[], stat: keyof Player) => {
    if (players.length < 2) return null
    const values = players.map((p) => p[stat] as number)
    const maxValue = Math.max(...values)
    return players.find((p) => p[stat] === maxValue)
  }

  const getRadarData = (player: Player) => {
    const categories = getPerformanceCategory(player);
    const efficiencyRating = calculateEfficiencyRating(player);
    
    return [
      { 
        category: "Attack", 
        value: Math.min(categories.attacking, 100),
        fullMark: 100
      },
      { 
        category: "Playmaking", 
        value: Math.min(categories.playmaking, 100),
        fullMark: 100
      },
      { 
        category: "Efficiency", 
        value: Math.min(efficiencyRating.efficiency, 100),
        fullMark: 100
      },
      { 
        category: "Consistency", 
        value: Math.min(categories.consistency || 0, 100),
        fullMark: 100
      },
      { 
        category: "Experience", 
        value: Math.min(categories.experience, 100),
        fullMark: 100
      },
      {
        category: "Overall",
        value: Math.min(efficiencyRating.overall, 100),
        fullMark: 100
      }
    ];
  }

  const getChartData = () => {
    return [
      {
        stat: "Goals",
        ...selectedPlayers.reduce((acc, p) => ({ ...acc, [`${p.name}_${p.id}`]: p.goal }), {}),
      },
      {
        stat: "Assists",
        ...selectedPlayers.reduce((acc, p) => ({ ...acc, [`${p.name}_${p.id}`]: p.assists }), {}),
      },
      {
        stat: "Apps",
        ...selectedPlayers.reduce((acc, p) => ({ ...acc, [`${p.name}_${p.id}`]: p.apps / 10 }), {}),
      },
      {
        stat: "G+A",
        ...selectedPlayers.reduce((acc, p) => ({ ...acc, [`${p.name}_${p.id}`]: p.gPlusA }), {}),
      },
    ]
  }

  const getPerMatchChartData = () => {
    return [
      {
        stat: "G/M",
        ...selectedPlayers.reduce((acc, p) => ({ ...acc, [`${p.name}_${p.id}`]: Number.parseFloat(p.gPm.toFixed(3)) }), {}),
      },
      {
        stat: "A/M",
        ...selectedPlayers.reduce((acc, p) => ({ ...acc, [`${p.name}_${p.id}`]: Number.parseFloat(p.aPm.toFixed(3)) }), {}),
      },
      {
        stat: "G+A/M",
        ...selectedPlayers.reduce((acc, p) => ({ ...acc, [`${p.name}_${p.id}`]: Number.parseFloat(p.gAPm.toFixed(3)) }), {}),
      },
    ]
  }

  const getPositionDistributionData = () => {
    const positions = ["SS", "CF", "LWF", "AMF"]
    return positions.map((pos) => ({
      name: pos,
      value: playersData.filter((p) => p.position === pos).length,
    }))
  }

  const exportComparison = () => {
    const csvContent = [
      ["Player Comparison Report"],
      ["Generated: " + new Date().toLocaleDateString()],
      [],
      ["Name", "Team", "Position", "Age", "Goals", "Assists", "G+A", "Goals/90", "Assists/90", "G+A/90"],
      ...selectedPlayers.map(p => [
        p.name,
        p.team,
        p.position,
        p.age,
        p.goal,
        p.assists,
        p.gPlusA,
        p.gPm.toFixed(3),
        p.aPm.toFixed(3),
        p.gAPm.toFixed(3)
      ])
    ];
    
    const csv = csvContent.map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `player-comparison-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Advanced Player Comparison</h1>
        <p className="text-muted-foreground text-lg">
          Compare up to 4 players with detailed analytics, charts, and performance insights.
        </p>
      </div>
      
      {/* Main Content */}
      <div className="space-y-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {/* FULL-WIDTH CTA */}
          <DialogTrigger asChild>
            <Button className="w-full flex mb-4">
              <Plus className="w-5 h-5 mr-2" />
              Add Player to Compare
            </Button>
          </DialogTrigger>

          <div className="flex flex-col md:flex-row gap-6">

            {/* LEFT: Presets */}
            <div className="flex-1 space-y-4">

              <div className="space-y-4">

                {/* Evolutions */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Evolutions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2">
                    {PRESETS.filter(preset => preset.id.includes('evolution')).map((preset) => (
                      <Button
                        key={preset.id}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          loadPreset(preset);
                        }}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Positions */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Positions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2">
                    {PRESETS.filter(preset =>
                      ['epic-cfs', 'best-playmakers', 'top-wingers', 'elite-players'].includes(preset.id)
                    ).map((preset) => (
                      <Button
                        key={preset.id}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          loadPreset(preset);
                        }}
                      >
                        <Target className="w-3 h-3 mr-1" />
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Teams */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Top Teams</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2">
                    {PRESETS.filter(preset => preset.team).map((preset) => (
                      <Button
                        key={preset.id}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          loadPreset(preset);
                        }}
                      >
                        <Trophy className="w-3 h-3 mr-1" />
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT: Quick Tips - Hidden on mobile */}
            <div className="hidden md:block w-64 shrink-0 mt-6">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <h4 className="font-medium mb-1 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-1.5 text-blue-600" />
                  Quick Tips
                </h4>
                <ul className="space-y-1 list-disc pl-5">
                  <li>Click <strong>twice</strong> on a team preset to cycle through players</li>
                  <li>If a player doesn’t open, click the player preset <strong>twice</strong> to compare</li>
                  <li>Compare up to 4 players at once</li>
                </ul>

              </div>
            </div>

          </div>


            
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Select a Player</DialogTitle>
              <DialogDescription>Search and select a player to add to your comparison.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Presets Section */}
              {/* <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Quick Presets</h3>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((preset) => (
                    <Button
                      key={preset.id}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        loadPreset(preset);
                      }}
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div> */}

              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search players by name, team, or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

                <div className="space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={positionFilter === "" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPositionFilter("")}
                    >
                      All Positions
                    </Button>
                    {["SS", "CF", "LWF", "AMF","RWF",].map((pos) => (
                      <Button
                        key={pos}
                        variant={positionFilter === pos ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPositionFilter(pos)}
                      >
                        {pos}
                      </Button>
                    ))}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={cardTypeFilter === "" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCardTypeFilter("")}
                    >
                      All Cards
                    </Button>
                    {["epic", "epic-big time","show-time","Highlight"].map((card) => (
                      <Button
                        key={card}
                        variant={cardTypeFilter === card ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCardTypeFilter(card)}
                      >
                        {card}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredPlayers.map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center space-x-4 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedPlayers.find((p) => p.id === player.id) ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Player clicked:', player.name);
                        addPlayer(player);
                      }}
                    >
                      <img
                        src={player.image || "/placeholder.svg?height=48&width=48&query=football player"}
                        alt={player.name}
                        className="w-24 h-34 rounded-none object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{formatPlayerName(player.name)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {player.position} • {player.team === "NAN" ? "Free Agent" : formatPlayerName(player.team)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="font-bold mb-1">
                          {player.cardType}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{player.apps} apps</p>
                      </div>
                      {selectedPlayers.find((p) => p.id === player.id) && (
                        <Badge variant="outline">Already Added</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {selectedPlayers.length > 0 && (
            <p className="text-sm text-muted-foreground">{selectedPlayers.length}/4 players selected</p>
          )}
        </div>

        {/* Selected Players */}
        {selectedPlayers.length > 0 ? (
          <div className="space-y-8">
            {/* Mobile View - 2x2 Grid (only when 4 players are selected) */}
            {selectedPlayers.length === 4 && (
              <div className="md:hidden">
                <div className="grid grid-cols-2 gap-2">
                  {selectedPlayers.map((player) => (
                    <div key={`mobile-${player.id}`} className="flex flex-col items-center p-2 border rounded-lg">
                      <img
                        src={player.image || "/placeholder.svg?height=64&width=64&query=football player"}
                        alt={player.name}
                        className="w-20 h-28 object-cover mb-1"
                      />
                      <span className="text-sm font-medium text-center">{formatPlayerName(player.name)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0 absolute top-1 right-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePlayer(player.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop View - Always shows full cards */}
            <div className={`${selectedPlayers.length === 4 ? 'hidden md:grid' : 'grid'} grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`}>
              {selectedPlayers.map((player) => (
                <Card key={player.id} className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 z-10 hover:bg-red-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Removing player:', player.id, player.name);
                      removePlayer(player.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardHeader className="pb-4">
                    <div className="flex flex-col items-center text-center">
                      <img
                        src={player.image || "/placeholder.svg?height=64&width=64&query=football player"}
                        alt={player.name}
                        className="w-24 h-34 rounded-none object-cover mb-3"
                      />
                      <CardTitle className="text-lg">{formatPlayerName(player.name)}</CardTitle>
                      <CardDescription>
                        {player.position} • {player.team === "NAN" ? "Free Agent" : formatPlayerName(player.team)}
                      </CardDescription>
                      <Badge variant="secondary" className="mt-2 text-sm font-bold px-3 py-1">
                        {player.cardType}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">Age: {player.age}</p>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {selectedPlayers.length > 0 && (
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={exportComparison}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            )}

            <Tabs defaultValue="charts" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="charts" className="flex items-center gap-1 text-xs md:text-sm">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Charts</span>
                </TabsTrigger>
                <TabsTrigger value="detailed" className="flex items-center gap-1 text-xs md:text-sm">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Stats</span>
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-1 text-xs md:text-sm">
                  <Target className="w-4 h-4" />
                  <span className="hidden sm:inline">Rating</span>
                </TabsTrigger>
                <TabsTrigger value="efficiency" className="flex items-center gap-1 text-xs md:text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Efficiency</span>
                </TabsTrigger>
                <TabsTrigger value="headtohead" className="flex items-center gap-1 text-xs md:text-sm">
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">H2H</span>
                </TabsTrigger>
                <TabsTrigger value="radar" className="flex items-center gap-1 text-xs md:text-sm">
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Radar</span>
                </TabsTrigger>
              </TabsList>

              {/* <TabsContent value="charts" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Absolute Stats Comparison</CardTitle>
                    <CardDescription>Goals, Assists, and Total Contributions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="stat" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {selectedPlayers.map((player, idx) => (
                          <Bar
                            key={player.id}
                            dataKey={`${player.name}_${player.id}`}
                            fill={["#3b82f6", "#ef4444", "#10b981", "#f59e0b"][idx]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Per-Match Performance</CardTitle>
                    <CardDescription>Goals, Assists, and Combined Efficiency per Match</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getPerMatchChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="stat" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {selectedPlayers.map((player, idx) => (
                          <Line
                            key={player.id}
                            type="monotone"
                            dataKey={`${player.name}_${player.id}`}
                            stroke={["#3b82f6", "#ef4444", "#10b981", "#f59e0b"][idx]}
                            strokeWidth={2}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Age vs Efficiency Analysis</CardTitle>
                    <CardDescription>Player age compared to overall efficiency rating</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="age" name="Age" />
                        <YAxis type="number" dataKey="efficiency" name="Efficiency" />
                        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                        {selectedPlayers.map((player, idx) => (
                          <Scatter
                            key={player.id}
                            name={player.name}
                            data={[{ age: player.age, efficiency: calculateEfficiencyRating(player).overall }]}
                            fill={["#3b82f6", "#ef4444", "#10b981", "#f59e0b"][idx]}
                          />
                        ))}
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent> */}

                <TabsContent value="charts" className="space-y-6">
                  {/* Absolute Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Absolute Stats Comparison</CardTitle>
                      <CardDescription>Goals, Assists, and Total Contributions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getChartData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="stat" />
                          <YAxis />
                          <Tooltip
                            formatter={(value, name) => [
                              value,
                              String(name).split("_")[0],
                            ]}
                          />
                          <Legend
                            formatter={(value) => String(value).split("_")[0]}
                          />
                          {selectedPlayers.map((player, idx) => (
                            <Bar
                              key={player.id}
                              dataKey={`${player.name}_${player.id}`}
                              fill={["#3b82f6", "#ef4444", "#10b981", "#f59e0b"][idx]}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Per Match Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Per-Match Performance</CardTitle>
                      <CardDescription>
                        Goals, Assists, and Combined Efficiency per Match
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={getPerMatchChartData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="stat" />
                          <YAxis />
                          <Tooltip
                            formatter={(value, name) => [
                              value,
                              String(name).split("_")[0],
                            ]}
                          />
                          <Legend
                            formatter={(value) => String(value).split("_")[0]}
                          />
                          {selectedPlayers.map((player, idx) => (
                            <Line
                              key={player.id}
                              type="monotone"
                              dataKey={`${player.name}_${player.id}`}
                              stroke={["#3b82f6", "#ef4444", "#10b981", "#f59e0b"][idx]}
                              strokeWidth={2}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Age vs Efficiency */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Age vs Efficiency Analysis</CardTitle>
                      <CardDescription>
                        Player age compared to overall efficiency rating
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" dataKey="age" name="Age" />
                          <YAxis type="number" dataKey="efficiency" name="Efficiency" />
                          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                          {selectedPlayers.map((player, idx) => (
                            <Scatter
                              key={player.id}
                              name={player.name}
                              data={[
                                {
                                  age: player.age,
                                  efficiency: calculateEfficiencyRating(player).overall,
                                },
                              ]}
                              fill={["#3b82f6", "#ef4444", "#10b981", "#f59e0b"][idx]}
                            />
                          ))}
                        </ScatterChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                
              {/* Detailed Comparison Table */}
              <TabsContent value="detailed" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed eFootball Stats Comparison</CardTitle>
                    <CardDescription>Compare key eFootball card statistics and performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold">Statistic</th>
                            {selectedPlayers.map((player) => (
                              <th key={player.id} className="text-center py-3 px-4 font-semibold min-w-32">
                                {formatPlayerName(player.name)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="space-y-2">
                          {[
                            { label: "Card Type", key: "cardType" },
                            { label: "Age", key: "age" },
                            { label: "Appearances", key: "apps" },
                            { label: "Goals", key: "goal" },
                            { label: "Assists", key: "assists" },
                            { label: "Goals + Assists", key: "gPlusA" },
                            { label: "Goals per Match", key: "gPm" },
                            { label: "Assists per Match", key: "aPm" },
                            { label: "G+A per Match", key: "gAPm" },
                          ].map((stat) => (
                            <tr key={stat.key} className="border-b border-border/50">
                              <td className="py-3 px-4 font-medium">{stat.label}</td>
                              {selectedPlayers.map((player) => (
                                <td key={player.id} className="text-center py-3 px-4">
                                  {stat.key === "cardType" ? (
                                    <Badge variant="outline" className="font-bold">
                                      {player[stat.key as keyof Player]}
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="secondary"
                                      className={`${getStatColor(player[stat.key as keyof Player] as number, stat.key)} font-bold`}
                                    >
                                      {typeof player[stat.key as keyof Player] === "number" &&
                                      (stat.key === "gPm" || stat.key === "aPm" || stat.key === "gAPm")
                                        ? (player[stat.key as keyof Player] as number).toFixed(3)
                                        : player[stat.key as keyof Player]}
                                    </Badge>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex flex-wrap justify-end gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
                      <span>Excellent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500/80"></span>
                      <span>Good</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-orange-500/80"></span>
                      <span>Meduim</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                      <span>Low</span>
                    </div>
                  </div>

                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="efficiency" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedPlayers.map((player) => {
                    const efficiency = calculateEfficiencyRating(player)
                    return (
                      <Card key={player.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3">
                            <img
                              src={player.image || "/placeholder.svg?height=40&width=40&query=football player"}
                              alt={player.name}
                              className="w-24 h-34 rounded-none object-cover"
                            />
                            {formatPlayerName(player.name)}
                          </CardTitle>
                          <CardDescription>Efficiency Rating Analysis</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {Object.entries(efficiency).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium capitalize">
                                  {key === "overall" ? "Overall Rating" : key}
                                </span>
                                <span
                                  className={`text-sm font-bold ${key === "overall" ? "text-lg text-primary" : ""}`}
                                >
                                  {typeof value === "number" ? value.toFixed(1) : value}/100
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-3">
                                <div
                                  className={`h-3 rounded-full transition-all ${
                                    value >= 80
                                      ? "bg-green-500"
                                      : value >= 60
                                        ? "bg-blue-500"
                                        : value >= 40
                                          ? "bg-yellow-500"
                                          : "bg-gray-400"
                                  }`}
                                  style={{ width: `${Math.min(value as number, 100)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedPlayers.map((player) => {
                    const categories = getPerformanceCategory(player)
                    return (
                      <Card key={player.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3">
                            <img
                              src={player.image || "/placeholder.svg?height=40&width=40&query=football player"}
                              alt={player.name}
                              className="w-24 h-34 rounded-none object-cover"
                            />
                            {formatPlayerName(player.name)}
                          </CardTitle>
                          <CardDescription>Performance Category Analysis</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {Object.entries(categories).map(([category, score]) => (
                            <div key={category} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium capitalize">{category}</span>
                                <span className="text-sm font-bold">{score.toFixed(1)}/100</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    score >= 80
                                      ? "bg-green-500"
                                      : score >= 60
                                        ? "bg-blue-500"
                                        : score >= 40
                                          ? "bg-yellow-500"
                                          : "bg-gray-400"
                                  }`}
                                  style={{ width: `${Math.min(score, 100)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="headtohead" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Head-to-Head Winners</CardTitle>
                    <CardDescription>See who leads in each statistical category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { label: "Most Goals", key: "goal" as keyof Player },
                        { label: "Most Assists", key: "assists" as keyof Player },
                        { label: "Most Appearances", key: "apps" as keyof Player },
                        { label: "Best Goals per Match", key: "gPm" as keyof Player },
                        { label: "Best Assists per Match", key: "aPm" as keyof Player },
                        { label: "Best G+A per Match", key: "gAPm" as keyof Player },
                      ].map((stat) => {
                        const winner = getHeadToHeadWinner(selectedPlayers, stat.key)
                        return (
                          <div key={stat.key} className="flex items-center justify-between p-4 rounded-lg border">
                            <div className="font-medium">{stat.label}</div>
                            {winner && (
                              <div className="flex items-center gap-3">
                                <img
                                  src={winner.image || "/placeholder.svg?height=32&width=32&query=football player"}
                                  alt={winner.name}
                                  className="w-12 h-17 rounded-none object-cover"
                                />
                                <div className="text-right">
                                  <div className="font-semibold">{formatPlayerName(winner.name)}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {typeof winner[stat.key] === "number" &&
                                    (stat.key === "gPm" || stat.key === "aPm" || stat.key === "gAPm")
                                      ? (winner[stat.key] as number).toFixed(3)
                                      : winner[stat.key]}
                                  </div>
                                </div>
                                <Trophy className="w-5 h-5 text-yellow-500" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="radar" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedPlayers.map((player) => {
                    const radarData = getRadarData(player)
                    return (
                      <Card key={player.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3">
                            <img
                              src={player.image || "/placeholder.svg?height=40&width=40&query=football player"}
                              alt={player.name}
                              className="w-24 h-34 rounded-none object-cover"
                            />
                            {formatPlayerName(player.name)}
                          </CardTitle>
                          <CardDescription>Multi-dimensional Performance Analysis</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={radarData}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="category" />
                              <PolarRadiusAxis angle={90} domain={[0, 100]} />
                              <Radar
                                name={player.name}
                                dataKey="value"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.6}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                            <div className="text-sm font-medium mb-1">Overall Rating</div>
                            <div className="text-2xl font-bold text-primary">
                              {(radarData.reduce((sum, item) => sum + item.value, 0) / radarData.length).toFixed(0)}/100
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <Card style={{ margin: '2rem' }} className="text-center py-12">
            <CardContent>
              <div className="text-muted-foreground mb-4">
                <Users className="w-24 h-34 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Players Selected</h3>
                <p>
                  Click "Add Player to Compare" to start comparing eFootball player cards with advanced analytics and
                  charts.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

