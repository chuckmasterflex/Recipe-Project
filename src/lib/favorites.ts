import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'recipe-hub:favorites'

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const names: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(names) ? new Set(names.filter((n) => typeof n === 'string')) : new Set()
  } catch {
    return new Set()
  }
}

function save(names: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...names]))
  } catch {
    // Private-browsing or quota errors: favorites just don't persist this session.
  }
}

/** Per-browser favorites, so you and a friend on separate devices keep separate lists. */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => load())

  useEffect(() => {
    save(favorites)
  }, [favorites])

  const toggle = useCallback((name: string) => {
    setFavorites((current) => {
      const next = new Set(current)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }, [])

  return { favorites, toggle }
}
