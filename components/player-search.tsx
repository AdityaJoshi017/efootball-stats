"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { playersData } from "@/lib/players-data"
import { Input } from "@/components/ui/input"

export function PlayerSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<typeof playersData>([])
  const [isOpen, setIsOpen] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Filter players based on search query
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = playersData.filter((player) =>
      player.name.toLowerCase().includes(query)
    )

    // Limit to 8 suggestions
    setSuggestions(filtered.slice(0, 8))
    setIsOpen(true)
  }, [searchQuery])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelectPlayer = (playerId: number) => {
    setSearchQuery("")
    setSuggestions([])
    setIsOpen(false)
    router.push(`/players/${playerId}`)
  }

  const handleClear = () => {
    setSearchQuery("")
    setSuggestions([])
    setIsOpen(false)
  }

  return (
    <div ref={searchContainerRef} className="relative w-full max-w-sm">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.trim().length > 0 && setIsOpen(true)}
          className="pl-10 pr-10 py-2 text-sm"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 hover:bg-accent rounded-md transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-popover border border-border rounded-lg shadow-lg z-[9999] max-h-80 overflow-y-auto">
          {suggestions.map((player) => (
            <button
              key={player.id}
              onClick={() => handleSelectPlayer(player.id)}
              className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border last:border-b-0 flex items-center justify-between group"
            >
              <div className="flex flex-col min-w-0">
                <div className="font-medium text-sm truncate">{player.name}</div>
                <div className="text-xs text-muted-foreground">
                  {player.position} • {player.team}
                </div>
              </div>
              <div className="ml-3 text-xs text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                {player.age}y
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && searchQuery.trim().length > 0 && suggestions.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-popover border border-border rounded-lg shadow-lg p-4 z-[9999] text-center text-sm text-muted-foreground">
          No players found matching &quot;{searchQuery}&quot;
        </div>
      )}
    </div>
  )
}
