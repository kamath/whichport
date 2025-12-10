import type { WatchlistEntry } from '@/types/port'

const STORAGE_KEY = 'which-port-watchlist'

export function loadWatchlist(): WatchlistEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch {
    console.error('Failed to load watchlist from localStorage')
    return []
  }
}

export function saveWatchlist(entries: WatchlistEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch (error) {
    console.error('Failed to save watchlist to localStorage', error)
  }
}

export function generateId(): string {
  return crypto.randomUUID()
}
