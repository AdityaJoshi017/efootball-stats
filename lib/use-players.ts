"use client"

import { useState, useEffect, useRef } from "react"
import { api } from "./api"
import { playersData as defaultPlayers, type Player as OldPlayer } from "./players-data"

export type Player = {
  id: number
  name: string
  team: string
  position: string
  age: number
  cardType: string
  cardSlug: string
  displayName: string
  apps: number
  goal: number
  assists: number
  image?: string
  stats: {
    apps: number
    goals: number
    assists: number
    gPlusA: number
    gPm: number
    aPm: number
    gAPm: number
  }
}

// Transform hardcoded data to API format
const transformOldPlayer = (oldPlayer: OldPlayer): Player => ({
  id: oldPlayer.id,
  name: oldPlayer.name,
  team: oldPlayer.team,
  position: oldPlayer.position,
  age: oldPlayer.age,
  cardType: oldPlayer.cardType,
  cardSlug: `${oldPlayer.name.toLowerCase().replace(/\s+/g, '-')}-${oldPlayer.team.toLowerCase().replace(/\s+/g, '-')}-${oldPlayer.position}-${oldPlayer.age}-${oldPlayer.cardType}`,
  displayName: `${oldPlayer.name} (${oldPlayer.team}, ${oldPlayer.position}, ${oldPlayer.cardType})`,
  apps: oldPlayer.apps,
  goal: oldPlayer.goal,
  assists: oldPlayer.assists,
  image: oldPlayer.image,
  stats: {
    apps: oldPlayer.apps,
    goals: oldPlayer.goal,
    assists: oldPlayer.assists,
    gPlusA: oldPlayer.gPlusA,
    gPm: oldPlayer.gPm,
    aPm: oldPlayer.aPm,
    gAPm: oldPlayer.gAPm,
  }
})

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const fetchPlayers = async () => {
      try {
        const data = await api.getPlayers()
        setPlayers(data)
      } catch (error) {
        console.error("Failed to fetch players from API, using fallback data:", error)
        // Fallback to hardcoded data
        const fallbackPlayers = defaultPlayers.map(transformOldPlayer)
        setPlayers(fallbackPlayers)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  const addPlayer = (newPlayer: Player) => {
    setPlayers((prev) => [...prev, newPlayer])
  }

  const updatePlayer = (playerId: number, updatedPlayer: Player) => {
    setPlayers((prev) => 
      prev.map((p) => p.id === playerId ? updatedPlayer : p)
    )
  }

  const deletePlayer = (playerId: number) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId))
  }

  return { players, isLoading, addPlayer, updatePlayer, deletePlayer }
}
