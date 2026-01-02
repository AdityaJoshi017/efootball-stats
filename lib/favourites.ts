export type CurrentUser = {
  id: number
  name: string
  email: string
}

const getCurrentUser = (): CurrentUser | null => {
  try {
    const raw = localStorage.getItem("currentUser")
    if (!raw) return null
    return JSON.parse(raw) as CurrentUser
  } catch {
    return null
  }
}

const getFavouritesStorageKey = (userId: number) => `favourites:${userId}`

export const getFavouritePlayerIds = (userId?: number): number[] => {
  const resolvedUserId = userId ?? getCurrentUser()?.id
  if (!resolvedUserId) return []

  try {
    const raw = localStorage.getItem(getFavouritesStorageKey(resolvedUserId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x) => typeof x === "number")
  } catch {
    return []
  }
}

export const isFavouritePlayer = (playerId: number, userId?: number): boolean => {
  const favs = getFavouritePlayerIds(userId)
  return favs.includes(playerId)
}

export const setFavouritePlayerIds = (playerIds: number[], userId?: number) => {
  const resolvedUserId = userId ?? getCurrentUser()?.id
  if (!resolvedUserId) return

  const unique = Array.from(new Set(playerIds)).filter((x) => Number.isFinite(x))
  localStorage.setItem(getFavouritesStorageKey(resolvedUserId), JSON.stringify(unique))
}

export const toggleFavouritePlayer = (playerId: number, userId?: number): boolean => {
  const resolvedUserId = userId ?? getCurrentUser()?.id
  if (!resolvedUserId) return false

  const current = getFavouritePlayerIds(resolvedUserId)
  const next = current.includes(playerId) ? current.filter((id) => id !== playerId) : [...current, playerId]
  setFavouritePlayerIds(next, resolvedUserId)
  return next.includes(playerId)
}
