import { useState, useEffect, useCallback } from 'react'
import { loadWatchlist, saveWatchlist, generateId } from '@/lib/storage'
import type { WatchlistEntry } from '@/types/port'

export function useWatchlist() {
  const [entries, setEntries] = useState<WatchlistEntry[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setEntries(loadWatchlist())
    setIsLoaded(true)
  }, [])

  // Persist changes (only after initial load to avoid overwriting)
  useEffect(() => {
    if (isLoaded) {
      saveWatchlist(entries)
    }
  }, [entries, isLoaded])

  const addEntry = useCallback(
    (entry: Omit<WatchlistEntry, 'id' | 'createdAt'>) => {
      // Check for duplicates
      const isDuplicate = entries.some(
        (existing) =>
          existing.host === entry.host &&
          existing.port === entry.port &&
          existing.endpointPath === entry.endpointPath
      )

      if (isDuplicate) {
        return null
      }

      const newEntry: WatchlistEntry = {
        ...entry,
        id: generateId(),
        createdAt: Date.now(),
      }
      setEntries((prev) => [...prev, newEntry])
      return newEntry
    },
    [entries]
  )

  const updateEntry = useCallback(
    (id: string, updates: Partial<WatchlistEntry>) => {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, ...updates } : entry
        )
      )
    },
    []
  )

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
  }, [])

  return {
    entries,
    addEntry,
    updateEntry,
    removeEntry,
  }
}
