"use client"

import { useState, useEffect, useRef } from "react"
import { api, adminApi } from "./api"
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
        // Ensure all players have required fields and proper structure
        const safePlayers = data.map((p: any) => ({
          id: p.id,
          name: p.name || 'Unknown Player',
          team: p.team || 'N/A',
          position: p.position || 'Unknown',
          age: p.age || 0,
          cardType: p.cardType || 'Standard',
          cardSlug: p.cardSlug || `${p.name || 'unknown'}-${p.team || 'na'}`,
          displayName: p.displayName || `${p.name || 'Unknown'} (${p.team || 'N/A'})`,
          apps: p.apps || 0,
          goal: p.goal || 0,
          assists: p.assists || 0,
          image: p.image,
          stats: p.stats || {
            apps: p.apps || 0,
            goals: p.goal || 0,
            assists: p.assists || 0,
            gPlusA: (p.goal || 0) + (p.assists || 0),
            gPm: p.apps > 0 ? (p.goal || 0) / p.apps : 0,
            aPm: p.apps > 0 ? (p.assists || 0) / p.apps : 0,
            gAPm: p.apps > 0 ? ((p.goal || 0) + (p.assists || 0)) / p.apps : 0,
          }
        }))
        setPlayers(safePlayers)
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

  const updatePlayer = async (playerId: number, updatedStats: { apps: number; goal: number; assists: number }) => {
    try {
      // Call the backend API to update the player
      await adminApi.updatePlayer(playerId, {
        apps: updatedStats.apps,
        goal: updatedStats.goal,
        assists: updatedStats.assists,
      })
      
      // Update local state after successful API call
      setPlayers((prev) => 
        prev.map((p) => {
          if (p.id === playerId) {
            const newApps = updatedStats.apps
            const newGoal = updatedStats.goal
            const newAssists = updatedStats.assists
            return {
              ...p,
              apps: newApps,
              goal: newGoal,
              assists: newAssists,
              stats: {
                apps: newApps,
                goals: newGoal,
                assists: newAssists,
                gPlusA: newGoal + newAssists,
                gPm: newApps > 0 ? newGoal / newApps : 0,
                aPm: newApps > 0 ? newAssists / newApps : 0,
                gAPm: newApps > 0 ? (newGoal + newAssists) / newApps : 0,
              }
            }
          }
          return p
        })
      )
    } catch (error) {
      console.error("Failed to update player:", error)
      throw error
    }
  }

  const deletePlayer = (playerId: number) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId))
  }

  return { players, isLoading, addPlayer, updatePlayer, deletePlayer }
}
