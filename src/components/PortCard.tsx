import { useState } from 'react'
import {
  MoreVertical,
  RefreshCw,
  Trash2,
  Pencil,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusIndicator } from './StatusIndicator'
import { EditPortDialog } from './EditPortDialog'
import type { WatchlistEntry, PortStatus } from '@/types/port'

interface PortCardProps {
  entry: WatchlistEntry
  status?: PortStatus
  onRefresh: () => void
  onEdit: (id: string, updates: Partial<WatchlistEntry>) => void
  onRemove: () => void
}

export function PortCard({
  entry,
  status,
  onRefresh,
  onEdit,
  onRemove,
}: PortCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const url = `http://${entry.host}:${entry.port}${entry.endpointPath || ''}`

  const handleCardClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <Card
        className="cursor-pointer transition-shadow hover:shadow-md"
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <StatusIndicator status={status?.status || 'unknown'} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-medium">
                  {entry.label || `${entry.host}:${entry.port}`}
                </h3>
                {status?.pageTitle && (
                  <span className="text-muted-foreground truncate text-sm">
                    - {status.pageTitle}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground text-sm">{url}</p>

              {status?.lastChecked && (
                <p className="text-muted-foreground mt-1 text-xs">
                  Last checked:{' '}
                  {new Date(status.lastChecked).toLocaleTimeString()}
                  {status.responseTime !== undefined && (
                    <span className="ml-2">
                      ({Math.round(status.responseTime)}ms)
                    </span>
                  )}
                </p>
              )}

              {status?.httpStatus && status.httpStatus >= 400 && (
                <p className="mt-1 text-xs text-yellow-600">
                  HTTP {status.httpStatus}
                </p>
              )}

              {status?.error && (
                <p className="text-destructive mt-1 text-xs">{status.error}</p>
              )}
            </div>

            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={onRefresh}
                disabled={status?.status === 'checking'}
              >
                <RefreshCw
                  className={`h-4 w-4 ${status?.status === 'checking' ? 'animate-spin' : ''}`}
                />
              </Button>

              {status?.status === 'active' && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onRemove}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditPortDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        entry={entry}
        onSave={(updates) => {
          onEdit(entry.id, updates)
          setEditDialogOpen(false)
        }}
      />
    </>
  )
}
