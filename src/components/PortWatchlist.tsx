import { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PortCard } from './PortCard'
import { AddPortDialog } from './AddPortDialog'
import { RefreshControls } from './RefreshControls'
import { useWatchlist } from '@/hooks/useWatchlist'
import { usePortChecker } from '@/hooks/usePortChecker'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import type { WatchlistEntry } from '@/types/port'

export function PortWatchlist() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [duplicateError, setDuplicateError] = useState('')
  const { entries, addEntry, updateEntry, removeEntry } = useWatchlist()
  const { statuses, checkSinglePort, checkAllPorts } = usePortChecker(entries)
  const { config, updateConfig } = useAutoRefresh(checkAllPorts)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Initial check on mount (after entries are loaded)
  useEffect(() => {
    if (!hasInitialized && entries.length > 0) {
      setHasInitialized(true)
      checkAllPorts()
    }
  }, [entries, hasInitialized, checkAllPorts])

  // Check newly added entries
  const handleAddEntry = useCallback(
    (entry: Omit<WatchlistEntry, 'id' | 'createdAt'>) => {
      const newEntry = addEntry(entry)
      if (newEntry === null) {
        const path = entry.endpointPath ? ` (${entry.endpointPath})` : ''
        setDuplicateError(`Port ${entry.host}:${entry.port}${path} is already in your watchlist`)
        return
      }
      // Slight delay to ensure state is updated
      setTimeout(() => checkSinglePort(newEntry), 0)
      setAddDialogOpen(false)
      setDuplicateError('')
    },
    [addEntry, checkSinglePort]
  )

  const handleQuickAddPort = useCallback(
    (port: number, label: string) => {
      handleAddEntry({
        host: 'localhost',
        port,
        label,
      })
    },
    [handleAddEntry]
  )

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Port Watchlist</h1>
        <div className="flex items-center gap-2">
          <RefreshControls config={config} onConfigChange={updateConfig} />
          <Button
            variant="outline"
            size="icon"
            onClick={checkAllPorts}
            title="Refresh all"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Port
          </Button>
        </div>
      </div>

      {duplicateError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{duplicateError}</span>
          <button
            onClick={() => setDuplicateError('')}
            className="ml-auto text-red-700 hover:text-red-900"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {entries.length === 0 ? (
        <>
          <EmptyState onAddClick={() => setAddDialogOpen(true)} />
          <QuickAddPorts onQuickAdd={handleQuickAddPort} entries={entries} />
        </>
      ) : (
        <>
          <div className="space-y-3">
            {entries.map((entry) => (
              <PortCard
                key={entry.id}
                entry={entry}
                status={statuses[entry.id]}
                onRefresh={() => checkSinglePort(entry)}
                onEdit={updateEntry}
                onRemove={() => removeEntry(entry.id)}
              />
            ))}
          </div>
          <QuickAddPorts onQuickAdd={handleQuickAddPort} entries={entries} />
        </>
      )}

      <AddPortDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddEntry}
        existingEntries={entries}
      />
    </div>
  )
}

const COMMON_PORTS = [
  { port: 3000, label: 'React Dev' },
  { port: 5173, label: 'Vite Dev' },
  { port: 8080, label: 'Common' },
  { port: 8000, label: 'Python' },
  { port: 9000, label: 'Custom' },
  { port: 5432, label: 'PostgreSQL' },
  { port: 27017, label: 'MongoDB' },
]

interface EmptyStateProps {
  onAddClick: () => void
}

function EmptyState({ onAddClick }: EmptyStateProps) {
  return (
    <div className="rounded-lg border-2 border-dashed py-12 px-6 text-center">
      <p className="text-muted-foreground mb-4">
        No ports in your watchlist yet.
      </p>
      <Button onClick={onAddClick}>
        <Plus className="mr-2 h-4 w-4" />
        Add Your First Port
      </Button>
    </div>
  )
}

interface QuickAddPortsProps {
  onQuickAdd: (port: number, label: string) => void
  entries?: WatchlistEntry[]
}

function QuickAddPorts({ onQuickAdd, entries = [] }: QuickAddPortsProps) {
  const availablePorts = COMMON_PORTS.filter(
    ({ port }) => !entries.some((entry) => entry.port === port && entry.host === 'localhost')
  )

  if (availablePorts.length === 0) {
    return null
  }

  return (
    <div className="mt-8 pt-6 border-t">
      <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wide">
        Quick add common ports
      </p>
      <div className="flex flex-wrap gap-2">
        {availablePorts.map(({ port, label }) => (
          <Button
            key={port}
            variant="outline"
            size="sm"
            className="border-dashed"
            onClick={() => onQuickAdd(port, label)}
            title={label}
          >
            {port} <span className="ml-1 text-xs text-muted-foreground hidden sm:inline">({label})</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
