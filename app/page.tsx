'use client'
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PlayerImage } from "@/components/player-image"
import { useSearchParams } from 'next/navigation'
import { api } from "@/lib/api"
import { Search, X } from "lucide-react"
import type { Player } from "@/lib/api"

const NEXT_PUBLIC_IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:8000'

export default function HomePage() {
  const searchParams = useSearchParams()
	const playerId = searchParams.get('playerId')
	const [searchQuery, setSearchQuery] = useState('')
	const [searchResults, setSearchResults] = useState<Player[]>([])
	const [showDropdown, setShowDropdown] = useState(false)
	const [allPlayers, setAllPlayers] = useState<Player[]>([])

	// Fetch all players on mount
	useEffect(() => {
		const fetchPlayers = async () => {
			try {
				const players = await api.getPlayers()
				setAllPlayers(players)
			} catch (error) {
				console.error('Failed to fetch players:', error)
			}
		}
		fetchPlayers()
	}, [])

	// Handle search
	useEffect(() => {
		if (searchQuery.trim() === '') {
			setSearchResults([])
			setShowDropdown(false)
			return
		}

		const filtered = allPlayers
			.filter(player => 
				player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				player.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
				player.position.toLowerCase().includes(searchQuery.toLowerCase())
			)
			.slice(0, 5) // Max 5 results

		setSearchResults(filtered)
		setShowDropdown(true)
	}, [searchQuery, allPlayers])

	const featuredPlayers = [
    {
      id: 1,
      name: "Lionel Messi",
      position: "CF",
      club: "Barcelona",
      rating: 106,
      goals: 1002,
      assists: 445,
      image: "/1.jpg",
    },
    {
      id: 2,
      name: "Lionel Messi",
      position: "AMF",
      club: "NA",
      rating: 103,
      goals: 217,
      assists: 166,
      image: "/2.jpg",
    },
    {
      id: 3,
      name: "Lionel Messi",
      position: "SS",
      club: "Barcelona",
      rating: 105,
      goals: 136,
      assists: 56,
      image: "/3.jpg",
    },
  ]
const leaders = [
  {
    type: "goals",
    title: "Top Goal Scorer",
    player: {
      id: 1,
      name: "Lionel Messi",
      position: "CF",
      club: "Barcelona",
      rating: 106,
      goals: 1002,
      assists: 456,
      image: "/1.jpg",
    },
  },
  {
    type: "assists",
    title: "Top Assist Provider",
    player: {
      id: 1,
      name: "Lionel Messi",
      position: "CF",
      club: "Barcelona",
      rating: 106,
      goals: 1002,
      assists: 456,
      image: "/1.jpg",
    },
  },
  {
    type: "consistency",
    title: "Most Consistent Player",
    player: {
      id: 12,
      name: "Johan Cruyff",
      position: "SS",
      club: "Barcelona",
      rating: 102,
      goals: 275,
      assists: 276,
      image: "/12.jpg",
    },
  },
]



  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Search */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-black text-foreground mb-6 text-balance">
            ALL FOOTBALLERS
            <br />
            ARE <span className="text-primary">INDIVIDUALS</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Compare player statistics, analyze performance data, and discover the unique qualities that make each
            footballer special.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search players by name, team, or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-12 text-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setShowDropdown(false)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            
            {/* Search Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {searchResults.map((player) => (
                  <Link
                    key={player.id}
                    href={`/players/${player.id}`}
                    className="flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b last:border-b-0"
                    onClick={() => {
                      setSearchQuery('')
                      setShowDropdown(false)
                    }}
                  >
                    <img
                      src={player.image || "/placeholder.svg?height=64&width=48&query=football player"}
                      alt={player.name}
                      className="w-12 h-16 rounded object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=64&width=48&query=football player"
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">{player.displayName}</div>
                      <div className="text-sm text-muted-foreground">
                        {player.position} • {player.team}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/compare">Start Comparing</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent" asChild>
              <Link href="/players">Browse Players</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Players */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-foreground">Featured Players</h2>
            <Link href="/players" className="group font-medium text-primary">
              <span
                className="
                  relative inline-block
                  after:absolute after:left-0 after:-bottom-1
                  after:h-[2px] after:w-0
                  after:bg-primary after:transition-all after:duration-300
                  group-hover:after:w-full">
                View All Players →
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredPlayers.map((player) => (
              <Card key={player.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <PlayerImage src={player.image} alt={player.name} size="sm" />
                    <div>
                      <CardTitle className="text-xl">{player.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {player.position} • {player.club}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                      {player.rating}
                    </Badge>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Goals • Assists</div>
                      <div className="font-bold">
                        {player.goals} • {player.assists}
                      </div>
                    </div>
                  </div>
                  <Button className="w-full bg-transparent" variant="outline" asChild>
                    <Link href={`/players/${player.id}`}>View Stats</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
                 <section className="py-16 px-4 bg-muted/30">
	  <div className="container mx-auto">
	    {/* Header */}
	    <div className="flex items-center justify-between mb-12">
	      <h2 className="text-4xl font-bold text-foreground">
	        Top Players
	      </h2>

	      <Link href="/leaderboards" className="group font-medium text-primary">
	        <span
	          className="
	            relative inline-block
	            after:absolute after:left-0 after:-bottom-1
	            after:h-[2px] after:w-0
	            after:bg-primary after:transition-all after:duration-300
	            group-hover:after:w-full
	        "
	        >
	          View Leaderboards →
	        </span>
	      </Link>
	    </div>

    {/* Leaders Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {leaders.map(({ type, title, player }) => (
        <div key={type} className="flex flex-col">
          {/* ✅ FIXED-HEIGHT TITLE */}
          <Link
            href={`/leaderboards?tab=${type}`}
            className="group block mb-4"
          >
            <div className="min-h-[64px] flex items-end">
              <h3 className="text-2xl italic leading-tight transition-colors group-hover:text-primary">
                {title}
              </h3>
            </div>
          </Link>

          {/* ✅ CARD */}
          <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <PlayerImage
                  src={player.image}
                  alt={player.name}
                  size="sm"
                />

                <div className="min-w-0">
                  <CardTitle className="text-xl leading-tight line-clamp-2">
                    {player.name}
                  </CardTitle>
                  <CardDescription className="text-sm truncate">
                    {player.position} • {player.club}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col flex-1">
              <div className="flex items-center justify-between mb-4 min-h-[48px]">
                <Badge
                  variant="secondary"
                  className="text-lg font-bold px-4 py-1 min-w-[56px] text-center"
                >
                  {player.rating}
                </Badge>

                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    Goals • Assists
                  </div>
                  <div className="font-bold">
                    {player.goals} • {player.assists}
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <Link href={`/players/${player.id}`}>
                  View Details
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  </div>
</section>
  <footer className="bg-card border-t border-border py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">eFootball Stats</h3>
              <p className="text-muted-foreground text-sm">
                The ultimate platform for football player statistics and comparisons.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/players" className="hover:text-primary">
                    Player Database
                  </Link>
                </li>
                <li>
                  <Link href="/compare" className="hover:text-primary">
                    Player Comparison
                  </Link>
                </li>
                <li>
                  <Link href="/stats" className="hover:text-primary">
                    Advanced Stats
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Teams</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/players?team=Barcelona" className="hover:text-primary hover:underline">
                    Barcelona
                  </Link>
                </li>
                <li>
                  <Link href="/players?team=Man City" className="hover:text-primary hover:underline">
                    Man City
                  </Link>
                </li>
                <li>
                  <Link href="/players?team=PSG" className="hover:text-primary hover:underline">
                    PSG
                  </Link>
                </li>
                <li>
                  <Link href="/players?team=Real Madrid" className="hover:text-primary hover:underline">
                    Real Madrid
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">About me</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    target="_blank"
                    href="https://instagram.com"
                    className="hover:text-primary hover:underline"
                  >
                    instagram
                  </Link>
                </li>

                <li>
                  <Link
                    target="_blank"
                    href="https://x.com"
                    className="hover:text-primary hover:underline"
                  >
                    X (Twitter)
                  </Link>
                </li>

                <li>
                  <Link
                    target="_blank"
                    href="https://github.com"
                    className="hover:text-primary hover:underline"
                  >
                    github
                  </Link>
                </li>

                <li>
                  <Link
                    target="_blank"
                    href="https://linkedin.com"
                    className="hover:text-primary hover:underline"
                  >
                    linkedin
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            By Aditya Joshi
          </div>
        </div>
      </footer>
    </div>
  )
}
