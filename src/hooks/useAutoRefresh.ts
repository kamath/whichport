import { useState, useEffect, useCallback, useRef } from 'react'

export interface AutoRefreshConfig {
  enabled: boolean
  intervalSeconds: number
}

const REFRESH_CONFIG_KEY = 'which-port-refresh-config'
const DEFAULT_CONFIG: AutoRefreshConfig = {
  enabled: true,
  intervalSeconds: 10,
}

export function useAutoRefresh(onRefresh: () => void) {
  const [config, setConfig] = useState<AutoRefreshConfig>(() => {
    try {
      const stored = localStorage.getItem(REFRESH_CONFIG_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_CONFIG
    } catch {
      return DEFAULT_CONFIG
    }
  })

  const intervalRef = useRef<number | null>(null)
  const onRefreshRef = useRef(onRefresh)

  // Keep callback ref updated
  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])

  const updateConfig = useCallback((updates: Partial<AutoRefreshConfig>) => {
    setConfig((prev) => {
      const newConfig = { ...prev, ...updates }
      localStorage.setItem(REFRESH_CONFIG_KEY, JSON.stringify(newConfig))
      return newConfig
    })
  }, [])

  useEffect(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current)
    }

    if (config.enabled && config.intervalSeconds > 0) {
      // Calculate interval with jitter (±10%)
      const getNextInterval = () => {
        const jitterFraction = Math.random() * 0.2 - 0.1 // ±10%
        return config.intervalSeconds * 1000 * (1 + jitterFraction)
      }

      // Schedule first check with jitter
      const scheduleNextCheck = () => {
        intervalRef.current = window.setTimeout(() => {
          onRefreshRef.current()
          scheduleNextCheck()
        }, getNextInterval())
      }

      scheduleNextCheck()
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
      }
    }
  }, [config.enabled, config.intervalSeconds])

  return {
    config,
    updateConfig,
  }
}
