"use client"

import { useState, useEffect, useRef } from "react"
import { api } from "./api"

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
        console.error("Failed to fetch players:", error)
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
