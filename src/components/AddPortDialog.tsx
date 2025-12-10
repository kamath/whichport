import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { WatchlistEntry } from '@/types/port'

interface AddPortDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (entry: Omit<WatchlistEntry, 'id' | 'createdAt'>) => void
  existingEntries?: WatchlistEntry[]
}

export function AddPortDialog({ open, onOpenChange, onAdd, existingEntries = [] }: AddPortDialogProps) {
  const [host, setHost] = useState('localhost')
  const [port, setPort] = useState('')
  const [endpointPath, setEndpointPath] = useState('')
  const [label, setLabel] = useState('')
  const [error, setError] = useState('')

  const isDuplicate = (hostVal: string, portVal: string, pathVal: string): boolean => {
    const portNum = parseInt(portVal, 10)
    if (isNaN(portNum)) return false

    return existingEntries.some(
      (entry) =>
        entry.host === hostVal &&
        entry.port === portNum &&
        entry.endpointPath === (pathVal || undefined)
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const portNum = parseInt(port, 10)
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      setError('Port must be a number between 1 and 65535')
      return
    }

    const finalHost = host || 'localhost'
    if (isDuplicate(finalHost, port, endpointPath)) {
      setError('This port is already in your watchlist')
      return
    }

    onAdd({
      host: finalHost,
      port: portNum,
      endpointPath: endpointPath || undefined,
      label: label || undefined,
    })

    // Reset form
    setHost('localhost')
    setPort('')
    setEndpointPath('')
    setLabel('')
    setError('')
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError('')
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Port to Watchlist</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="localhost"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Port *</Label>
              <Input
                id="port"
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="3000"
                min={1}
                max={65535}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="path">Endpoint Path (optional)</Label>
            <Input
              id="path"
              value={endpointPath}
              onChange={(e) => setEndpointPath(e.target.value)}
              placeholder="/api/health"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Label (optional)</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="My Dev Server"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-700 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {port && !error && isDuplicate(host || 'localhost', port, endpointPath) && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-700 mt-0.5" />
              <p className="text-sm text-amber-700">This port is already in your watchlist</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!!(error || (port && isDuplicate(host || 'localhost', port, endpointPath)))}>Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
