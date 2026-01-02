"use client"

import { useState, useEffect, useRef } from "react"
import { playersData as defaultPlayers, type Player } from "./players-data"

 const PLAYER_STAT_OVERRIDES_KEY = "playerStatOverrides"

 type PlayerStatOverride = {
   apps: number
   goal: number
   assists: number
 }

 const readOverrides = (): Record<string, PlayerStatOverride> => {
   try {
     const raw = localStorage.getItem(PLAYER_STAT_OVERRIDES_KEY)
     if (!raw) return {}
     const parsed = JSON.parse(raw)
     if (!parsed || typeof parsed !== "object") return {}
     return parsed as Record<string, PlayerStatOverride>
   } catch {
     return {}
   }
 }

 const writeOverrides = (overrides: Record<string, PlayerStatOverride>) => {
   localStorage.setItem(PLAYER_STAT_OVERRIDES_KEY, JSON.stringify(overrides))
 }

 const applyOverride = (player: Player, override?: PlayerStatOverride): Player => {
   if (!override) return player
   const next: Player = {
     ...player,
     apps: override.apps,
     goal: override.goal,
     assists: override.assists,
     gPlusA: override.goal + override.assists,
     gPm: override.apps > 0 ? override.goal / override.apps : 0,
     aPm: override.apps > 0 ? override.assists / override.apps : 0,
     gAPm: override.apps > 0 ? (override.goal + override.assists) / override.apps : 0,
   }
   return next
 }

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 🔒 Prevent double execution in Strict Mode
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    try {
      const overrides = readOverrides()
      const importedPlayersJson = localStorage.getItem("importedPlayers")
      let importedPlayers: Player[] = []

      if (importedPlayersJson) {
        const parsed = JSON.parse(importedPlayersJson)

        importedPlayers = parsed.map((p: any, idx: number) => ({
          id: defaultPlayers.length + idx + 1,
          name: p.name,
          team: p.team,
          position: p.position,
          age: p.age,
          cardType: p.cardType,
          apps: p.apps,
          goal: p.goal,
          assists: p.assists,
          gPlusA: p.goal + p.assists,
          gPm: p.apps > 0 ? p.goal / p.apps : 0,
          aPm: p.apps > 0 ? p.assists / p.apps : 0,
          gAPm: p.apps > 0 ? (p.goal + p.assists) / p.apps : 0,
        }))
      }

      // ✅ SAFE: clone defaultPlayers
      const combined = [...defaultPlayers, ...importedPlayers]
      const withOverrides = combined.map((p) => applyOverride(p, overrides[String(p.id)]))
      setPlayers(withOverrides)
    } catch (err) {
      console.error("Failed to load players:", err)
      setPlayers([...defaultPlayers])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addPlayer = (newPlayer: Omit<Player, "id">) => {
    setPlayers((prev) => {
      const nextId = Math.max(...prev.map((p) => p.id), 0) + 1

      const playerWithId: Player = {
        ...newPlayer,
        id: nextId,
        gPlusA: newPlayer.goal + newPlayer.assists,
        gPm: newPlayer.apps > 0 ? newPlayer.goal / newPlayer.apps : 0,
        aPm: newPlayer.apps > 0 ? newPlayer.assists / newPlayer.apps : 0,
        gAPm: newPlayer.apps > 0 ? (newPlayer.goal + newPlayer.assists) / newPlayer.apps : 0,
      }

      const updated = [...prev, playerWithId]

      // persist only imported players
      const imported = updated.filter((p) => p.id > defaultPlayers.length)
      localStorage.setItem("importedPlayers", JSON.stringify(imported))

      return updated
    })
  }

  const updatePlayer = (playerId: number, updatedStats: Partial<Player>) => {
    setPlayers((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== playerId) return p

        const next = { ...p, ...updatedStats }
        next.gPlusA = next.goal + next.assists
        next.gPm = next.apps > 0 ? next.goal / next.apps : 0
        next.aPm = next.apps > 0 ? next.assists / next.apps : 0
        next.gAPm = next.apps > 0 ? (next.goal + next.assists) / next.apps : 0

        return next
      })

      const overrides = readOverrides()
      const updatedPlayer = updated.find((p) => p.id === playerId)
      if (updatedPlayer) {
        overrides[String(playerId)] = {
          apps: updatedPlayer.apps,
          goal: updatedPlayer.goal,
          assists: updatedPlayer.assists,
        }
        writeOverrides(overrides)
      }

      const imported = updated.filter((p) => p.id > defaultPlayers.length)
      localStorage.setItem("importedPlayers", JSON.stringify(imported))

      return updated
    })
  }

  return { players, isLoading, addPlayer, updatePlayer }
}

export { Player }
