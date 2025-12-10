import { useState, useEffect } from 'react'
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

interface EditPortDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: WatchlistEntry
  onSave: (updates: Partial<WatchlistEntry>) => void
}

export function EditPortDialog({
  open,
  onOpenChange,
  entry,
  onSave,
}: EditPortDialogProps) {
  const [host, setHost] = useState(entry.host)
  const [port, setPort] = useState(String(entry.port))
  const [endpointPath, setEndpointPath] = useState(entry.endpointPath || '')
  const [label, setLabel] = useState(entry.label || '')
  const [error, setError] = useState('')

  // Reset form when entry changes
  useEffect(() => {
    setHost(entry.host)
    setPort(String(entry.port))
    setEndpointPath(entry.endpointPath || '')
    setLabel(entry.label || '')
    setError('')
  }, [entry])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const portNum = parseInt(port, 10)
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      setError('Port must be a number between 1 and 65535')
      return
    }

    onSave({
      host: host || 'localhost',
      port: portNum,
      endpointPath: endpointPath || undefined,
      label: label || undefined,
    })
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
          <DialogTitle>Edit Port</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-host">Host</Label>
              <Input
                id="edit-host"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="localhost"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-port">Port *</Label>
              <Input
                id="edit-port"
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="3000"
                min={1}
                max={65535}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-path">Endpoint Path (optional)</Label>
            <Input
              id="edit-path"
              value={endpointPath}
              onChange={(e) => setEndpointPath(e.target.value)}
              placeholder="/api/health"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-label">Label (optional)</Label>
            <Input
              id="edit-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="My Dev Server"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
