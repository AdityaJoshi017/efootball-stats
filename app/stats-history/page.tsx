"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, TrendingUp, TrendingDown, Calendar, Filter, ArrowUpDown, LineChart } from "lucide-react"
import { api, StatUpdate, Player, SnapshotComparison } from "@/lib/api"
import { usePlayers } from "@/lib/use-players"
import { StatProgressChart } from "@/components/stats-history/StatProgressChart"
import { ComparisonCard } from "@/components/stats-history/ComparisonCard"

export default function StatsHistoryPage() {
  const { players } = usePlayers()
  const [statUpdates, setStatUpdates] = useState<StatUpdate[]>([])
  const [snapshotComparison, setSnapshotComparison] = useState<SnapshotComparison | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState<string>("all")
  const [selectedStatType, setSelectedStatType] = useState<string>("all")
  const [selectedSource, setSelectedSource] = useState<string>("all")
  const [sortField, setSortField] = useState<"createdAt" | "statType" | "change">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    loadStatUpdates()
    if (selectedPlayer !== "all") {
      loadSnapshotComparison()
    } else {
      setSnapshotComparison(null)
    }
  }, [selectedPlayer, selectedStatType, selectedSource])

  const loadStatUpdates = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (selectedPlayer !== "all") params.playerId = parseInt(selectedPlayer)
      if (selectedStatType !== "all") params.statType = selectedStatType
      if (selectedSource !== "all") params.updateSource = selectedSource

      const data = await api.getAllStatUpdates(params)
      setStatUpdates(data)
    } catch (error) {
      console.error("Error loading stat updates:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadSnapshotComparison = async () => {
    try {
      if (selectedPlayer !== "all") {
        const comparison = await api.compareSnapshot(parseInt(selectedPlayer))
        setSnapshotComparison(comparison)
      }
    } catch (error) {
      console.error("Error loading snapshot comparison:", error)
    }
  }

  const sortedUpdates = [...statUpdates].sort((a, b) => {
    let comparison = 0
    if (sortField === "createdAt") {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    } else if (sortField === "statType") {
      comparison = a.statType.localeCompare(b.statType)
    } else if (sortField === "change") {
      comparison = a.change - b.change
    }
    return sortOrder === "asc" ? comparison : -comparison
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatTypeColor = (statType: string) => {
    switch (statType) {
      case "goals":
        return "bg-green-100 text-green-800"
      case "assists":
        return "bg-blue-100 text-blue-800"
      case "apps":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case "form":
        return "bg-blue-50 text-blue-700"
      case "bulk_script":
        return "bg-orange-50 text-orange-700"
      case "manual":
        return "bg-gray-50 text-gray-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Stats Update History</h1>
          <p className="text-muted-foreground text-lg">
            Track all changes to player goals, assists, and matches played.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Player</label>
                <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Players" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Players</SelectItem>
                    {players.map((player) => (
                      <SelectItem key={player.id} value={player.id.toString()}>
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Stat Type</label>
                <Select value={selectedStatType} onValueChange={setSelectedStatType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Stats" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stats</SelectItem>
                    <SelectItem value="goals">Goals</SelectItem>
                    <SelectItem value="assists">Assists</SelectItem>
                    <SelectItem value="apps">Matches Played</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Update Source</label>
                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="form">Form Update</SelectItem>
                    <SelectItem value="bulk_script">Bulk Script</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <div className="flex gap-2">
                  <Select value={sortField} onValueChange={(value: any) => setSortField(value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Date</SelectItem>
                      <SelectItem value="statType">Stat Type</SelectItem>
                      <SelectItem value="change">Change Amount</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">Total Updates</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{statUpdates.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">Net Goals Change</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold flex items-center gap-2">
                {statUpdates
                  .filter((u) => u.statType === "goals")
                  .reduce((sum, u) => sum + u.change, 0) > 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
                {statUpdates
                  .filter((u) => u.statType === "goals")
                  .reduce((sum, u) => sum + u.change, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">Net Assists Change</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold flex items-center gap-2">
                {statUpdates
                  .filter((u) => u.statType === "assists")
                  .reduce((sum, u) => sum + u.change, 0) > 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
                {statUpdates
                  .filter((u) => u.statType === "assists")
                  .reduce((sum, u) => sum + u.change, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart and Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Stat Progress Chart
              </CardTitle>
              <CardDescription>
                {selectedPlayer !== "all"
                  ? `Progress for ${players.find((p) => p.id === parseInt(selectedPlayer))?.name || "selected player"}`
                  : "Stat progression over time"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StatProgressChart
                updates={statUpdates}
                statType={selectedStatType === "all" ? "all" : selectedStatType as any}
              />
            </CardContent>
          </Card>

          {selectedPlayer !== "all" && snapshotComparison && (
            <ComparisonCard
              comparison={snapshotComparison}
              playerName={players.find((p) => p.id === parseInt(selectedPlayer))?.name}
            />
          )}
        </div>

        {/* Activity Log Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Log
            </CardTitle>
            <CardDescription>
              Showing {sortedUpdates.length} of {statUpdates.length} updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : sortedUpdates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No stat updates found. Try adjusting your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Stat Type</TableHead>
                      <TableHead>Old Value</TableHead>
                      <TableHead>New Value</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>% Change</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Updated By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedUpdates.map((update) => (
                      <TableRow key={update.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {formatDate(update.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {update.player?.name || `Player #${update.playerId}`}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatTypeColor(update.statType)}`}>
                            {update.statType.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell>{update.oldValue}</TableCell>
                        <TableCell>{update.newValue}</TableCell>
                        <TableCell>
                          <span className={update.change > 0 ? "text-green-600 font-medium" : update.change < 0 ? "text-red-600 font-medium" : ""}>
                            {update.change > 0 ? "+" : ""}{update.change}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={update.percentChange > 0 ? "text-green-600" : update.percentChange < 0 ? "text-red-600" : ""}>
                            {update.percentChange > 0 ? "+" : ""}{update.percentChange}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${getSourceColor(update.updateSource)}`}>
                            {update.updateSource.replace("_", " ")}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {update.updatedBy}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
