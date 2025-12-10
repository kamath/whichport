import { Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { AutoRefreshConfig } from '@/hooks/useAutoRefresh'

interface RefreshControlsProps {
  config: AutoRefreshConfig
  onConfigChange: (updates: Partial<AutoRefreshConfig>) => void
}

export function RefreshControls({
  config,
  onConfigChange,
}: RefreshControlsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <h4 className="font-medium">Auto-Refresh Settings</h4>

          <div className="flex items-center justify-between">
            <Label htmlFor="auto-refresh">Auto-refresh</Label>
            <Switch
              id="auto-refresh"
              checked={config.enabled}
              onCheckedChange={(enabled) => onConfigChange({ enabled })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval">Interval (seconds)</Label>
            <Input
              id="interval"
              type="number"
              min={5}
              max={300}
              value={config.intervalSeconds}
              onChange={(e) =>
                onConfigChange({
                  intervalSeconds: Math.max(
                    5,
                    parseInt(e.target.value, 10) || 30
                  ),
                })
              }
              disabled={!config.enabled}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
