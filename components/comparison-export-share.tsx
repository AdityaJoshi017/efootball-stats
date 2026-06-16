"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Download, Share2, Copy, Check } from "lucide-react"
import { type Player } from "@/lib/use-players"
import { calculatePlayerRating } from "@/lib/leaderboard-utils"

interface ComparisonExportShareProps {
  player1: Player
  player2: Player
}

export function ComparisonExportShare({ player1, player2 }: ComparisonExportShareProps) {
  const [copied, setCopied] = useState(false)

  const generateShareLink = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const params = new URLSearchParams({
      p1: player1.id,
      p2: player2.id,
    })
    return `${baseUrl}/compare?${params.toString()}`
  }

  const shareLink = generateShareLink()

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadCSV = () => {
    const csvContent = [
      ["Player Comparison Report"],
      [""],
      ["Player Name", player1.name, player2.name],
      ["Rating", calculatePlayerRating(player1).toFixed(2), calculatePlayerRating(player2).toFixed(2)],
      ["Goals", player1.goal, player2.goal],
      ["Assists", player1.assists, player2.assists],
      ["Age", player1.age, player2.age],
      ["Position", player1.position, player2.position],
      ["Team", player1.team, player2.team],
      ["Card Type", player1.cardType, player2.cardType],
      ["Archetype", player1.archetypes?.join(", ") || "N/A", player2.archetypes?.join(", ") || "N/A"],
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `comparison-${player1.name}-vs-${player2.name}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadJSON = () => {
    const data = {
      comparison: {
        player1: {
          id: player1.id,
          name: player1.name,
          position: player1.position,
          team: player1.team,
          rating: calculatePlayerRating(player1),
          goals: player1.goal,
          assists: player1.assists,
          age: player1.age,
          cardType: player1.cardType,
        },
        player2: {
          id: player2.id,
          name: player2.name,
          position: player2.position,
          team: player2.team,
          rating: calculatePlayerRating(player2),
          goals: player2.goal,
          assists: player2.assists,
          age: player2.age,
          cardType: player2.cardType,
        },
        timestamp: new Date().toISOString(),
      },
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `comparison-${player1.name}-vs-${player2.name}.json`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share & Export</CardTitle>
        <CardDescription>Share this comparison or download the data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Share Link</label>
          <div className="flex gap-2">
            <Input value={shareLink} readOnly className="flex-1" />
            <Button size="sm" variant="outline" onClick={handleCopyLink} className="flex items-center gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Share this link with others to show them this comparison</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Download Data</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleDownloadCSV} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download as CSV
            </Button>
            <Button variant="outline" onClick={handleDownloadJSON} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download as JSON
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
          <p>Use shared links to compare players with others or bookmark your favorite comparisons.</p>
        </div>
      </CardContent>
    </Card>
  )
}
