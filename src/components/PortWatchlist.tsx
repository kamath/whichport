import { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
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
      // Slight delay to ensure state is updated
      setTimeout(() => checkSinglePort(newEntry), 0)
      setAddDialogOpen(false)
    },
    [addEntry, checkSinglePort]
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

      {entries.length === 0 ? (
        <EmptyState onAddClick={() => setAddDialogOpen(true)} />
      ) : (
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
      )}

      <AddPortDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddEntry}
      />
    </div>
  )
}

function EmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="rounded-lg border-2 border-dashed py-12 text-center">
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
