import { useState, useCallback, useRef, useEffect } from 'react'
import { checkPort } from '@/lib/portChecker'
import type { WatchlistEntry, PortStatus } from '@/types/port'

export function usePortChecker(entries: WatchlistEntry[]) {
  const [statuses, setStatuses] = useState<Record<string, PortStatus>>({})
  const checkingRef = useRef<Set<string>>(new Set())

  const checkSinglePort = useCallback(async (entry: WatchlistEntry) => {
    if (checkingRef.current.has(entry.id)) return

    checkingRef.current.add(entry.id)
    setStatuses((prev) => ({
      ...prev,
      [entry.id]: {
        ...prev[entry.id],
        id: entry.id,
        status: 'checking',
        lastChecked: Date.now(),
      },
    }))

    const result = await checkPort(
      entry.host,
      entry.port,
      entry.endpointPath || '/'
    )

    checkingRef.current.delete(entry.id)
    setStatuses((prev) => ({
      ...prev,
      [entry.id]: {
        id: entry.id,
        status: result.status,
        pageTitle: result.pageTitle,
        lastChecked: Date.now(),
        responseTime: result.responseTime,
        error: result.error,
        httpStatus: result.httpStatus,
      },
    }))
  }, [])

  const checkAllPorts = useCallback(async () => {
    await Promise.all(entries.map((entry) => checkSinglePort(entry)))
  }, [entries, checkSinglePort])

  // Clean up statuses for removed entries
  useEffect(() => {
    const entryIds = new Set(entries.map((e) => e.id))
    setStatuses((prev) => {
      const updated = { ...prev }
      for (const id of Object.keys(updated)) {
        if (!entryIds.has(id)) {
          delete updated[id]
        }
      }
      return updated
    })
  }, [entries])

  return {
    statuses,
    checkSinglePort,
    checkAllPorts,
  }
}
