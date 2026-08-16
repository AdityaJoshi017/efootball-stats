"use client"

import { useState, useEffect } from "react"
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

// Transform API player data to match Player structure
const transformAPIPlayer = (apiData: any): Player => {
  const player = apiData.player || apiData;
  const stats = apiData.stats || {
    apps: player.apps || 0,
    goals: player.goal || 0,
    assists: player.assists || 0,
    gPlusA: (player.goal || 0) + (player.assists || 0),
    gPm: player.apps > 0 ? (player.goal || 0) / player.apps : 0,
    aPm: player.apps > 0 ? (player.assists || 0) / player.apps : 0,
    gAPm: player.apps > 0 ? ((player.goal || 0) + (player.assists || 0)) / player.apps : 0,
  };

  return {
    id: player.id,
    name: player.name || 'Unknown Player',
    team: player.team || 'N/A',
    position: player.position || 'Unknown',
    age: player.age || 0,
    cardType: player.cardType || 'Standard',
    cardSlug: player.cardSlug || `unknown-${player.id}`,
    displayName: player.displayName || `${player.name || 'Unknown'} (${player.team || 'N/A'})`,
    apps: player.apps || 0,
    goal: player.goal || 0,
    assists: player.assists || 0,
    image: player.image,
    accountId: player.accountId || 1,
    ovrRating: player.ovrRating || player.ovr_rating,
    stats,
  };
};

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

export function usePlayer(playerId: number | null) {
  const [player, setPlayer] = useState<Player | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!playerId) {
      setPlayer(null)
      return
    }

    const fetchPlayer = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await api.getPlayer(playerId)
        setPlayer(transformAPIPlayer(data))
      } catch (error) {
        console.error("Failed to fetch player from API, using fallback data:", error)
        // Fallback to hardcoded data
        const fallbackPlayer = defaultPlayers.find(p => p.id === playerId)
        if (fallbackPlayer) {
          setPlayer(transformOldPlayer(fallbackPlayer))
        } else {
          setError("Player not found")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayer()
  }, [playerId])

  return { player, isLoading, error }
}