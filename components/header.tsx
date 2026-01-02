"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Moon, Sun, LogOut, User, Menu, X } from "lucide-react"

export function Header() {
  const router = useRouter()
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

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
