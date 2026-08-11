"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Moon, Sun, LogOut, User, Menu, X, Search } from "lucide-react"
import { api } from "@/lib/api"
import type { Player } from "@/lib/api"

const NEXT_PUBLIC_IMAGE_URL = 'http://localhost:8000'

export function Header() {
  const router = useRouter()
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Player[]>([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [allPlayers, setAllPlayers] = useState<Player[]>([])

  useEffect(() => {
    setMounted(true)
    // Get theme from localStorage or system preference
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light")
    setTheme(initialTheme)
    applyTheme(initialTheme)

    // Get current user
    const user = localStorage.getItem("currentUser")
    if (user) {
      setCurrentUser(JSON.parse(user))
    }

    const handleAuthChanged = () => {
      const nextUser = localStorage.getItem("currentUser")
      setCurrentUser(nextUser ? JSON.parse(nextUser) : null)
    }

    window.addEventListener("authChanged", handleAuthChanged as EventListener)

    // Fetch all players for search
    const fetchPlayers = async () => {
      try {
        const players = await api.getPlayers()
        setAllPlayers(players)
      } catch (error) {
        console.error('Failed to fetch players:', error)
      }
    }
    fetchPlayers()

    return () => {
      window.removeEventListener("authChanged", handleAuthChanged as EventListener)
    }
  }, [])

  const applyTheme = (newTheme: "light" | "dark") => {
    const html = document.documentElement
    if (newTheme === "dark") {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }
    localStorage.setItem("theme", newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    setCurrentUser(null)
    setIsUserMenuOpen(false)
    router.push("/")
  }

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([])
      setShowSearchDropdown(false)
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
    setShowSearchDropdown(true)
  }, [searchQuery, allPlayers])

  if (!mounted) return null

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-primary">
              eFootball Stats
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/players" className="text-sm font-medium hover:text-primary transition-colors">
                PLAYERS
              </Link>
              <Link href="/compare" className="text-sm font-medium hover:text-primary transition-colors">
                COMPARE
              </Link>
              <Link href="/leaderboards" className="text-sm font-medium hover:text-primary transition-colors">
                LEADERBOARDS
              </Link>
              <Link href="/stats" className="text-sm font-medium hover:text-primary transition-colors">
                STATS
              </Link>
              {/* <Link href="/stats-update" className="text-sm font-medium hover:text-primary transition-colors">
                UPDATE
              </Link>
              <Link href="/import" className="text-sm font-medium hover:text-primary transition-colors">
                IMPORT
              </Link> */}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 h-9 w-64 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setShowSearchDropdown(false)
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* Search Dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {searchResults.map((player) => (
                    <Link
                      key={player.id}
                      href={`/players/${player.id}`}
                      className="flex items-center gap-3 p-2 hover:bg-muted transition-colors border-b last:border-b-0"
                      onClick={() => {
                        setSearchQuery('')
                        setShowSearchDropdown(false)
                      }}
                    >
                      <img
                        src={player.image && !player.image.startsWith('/uploads/') ? player.image : (player.image ? `${NEXT_PUBLIC_IMAGE_URL}${player.image}` : "/placeholder.svg?height=48&width=32&query=football player")}
                        alt={player.name}
                        className="w-8 h-12 rounded object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=48&width=32&query=football player"
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{player.displayName}</div>
                        <div className="text-xs text-muted-foreground">
                          {player.position} • {player.team}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileNavOpen((v) => !v)}
              className="rounded-full md:hidden"
              title={isMobileNavOpen ? "Close menu" : "Open menu"}
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>

            {currentUser ? (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                >
                  <User className="w-4 h-4" />
                  {currentUser.name}
                </Button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md border bg-popover p-1 shadow-md z-50">
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">{currentUser.email}</div>
                    <button
                      className="w-full text-left rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        router.push("/profile")
                      }}
                    >
                      Profile
                    </button>
                    <button
                      className="w-full text-left rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        router.push("/favourites")
                      }}
                    >
                      Favourites
                    </button>
                    <div className="my-1 h-px bg-border" />
                    <button
                      className="w-full text-left rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                      onClick={handleLogout}
                    >
                      <span className="inline-flex items-center">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </nav>

        {isMobileNavOpen && (
          <div className="mt-4 md:hidden rounded-lg border bg-background p-3">
            <div className="flex flex-col gap-2">
              <Link
                href="/players"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMobileNavOpen(false)}
              >
                PLAYERS
              </Link>
              <Link
                href="/compare"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMobileNavOpen(false)}
              >
                COMPARE
              </Link>
              <Link
                href="/leaderboards"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMobileNavOpen(false)}
              >
                LEADERBOARDS
              </Link>
              <Link
                href="/stats"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMobileNavOpen(false)}
              >
                STATS
              </Link>
              {currentUser && (
                <Link
                  href="/profile"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  PROFILE
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
