"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getFavouritePlayerIds } from "@/lib/favourites"

type CurrentUser = {
  id: number
  name: string
  email: string
}

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem("currentUser")
    setCurrentUser(raw ? (JSON.parse(raw) as CurrentUser) : null)

    const handleAuthChanged = () => {
      const nextRaw = localStorage.getItem("currentUser")
      setCurrentUser(nextRaw ? (JSON.parse(nextRaw) as CurrentUser) : null)
    }

    window.addEventListener("authChanged", handleAuthChanged as EventListener)
    return () => window.removeEventListener("authChanged", handleAuthChanged as EventListener)
  }, [])

  const favouritesCount = useMemo(() => {
    if (!currentUser) return 0
    return getFavouritePlayerIds(currentUser.id).length
  }, [currentUser])

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>You need to sign in to view your profile.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your account shortcuts</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{currentUser.name}</CardTitle>
            <CardDescription>{currentUser.email}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="secondary">User ID: {currentUser.id}</Badge>
            <Badge variant="outline">Favourites: {favouritesCount}</Badge>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Favourites</CardTitle>
              <CardDescription>View and manage your favourite players.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/favourites">Open Favourites</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stats Update</CardTitle>
              <CardDescription>Update Apps/Goals/Assists and track metric changes.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/stats-update">Open Stats Update</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
