import { Loader2 } from 'lucide-react'
import type { PortStatus } from '@/types/port'

interface StatusIndicatorProps {
  status: PortStatus['status']
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  switch (status) {
    case 'active':
      return (
        <div className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
        </div>
      )
    case 'inactive':
      return <div className="h-3 w-3 rounded-full bg-red-500" />
    case 'checking':
      return <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />
    case 'unknown':
    default:
      return <div className="h-3 w-3 rounded-full bg-gray-400" />
  }
}
