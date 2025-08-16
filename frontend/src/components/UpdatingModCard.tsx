import { IconX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

import type { UpdatingMod } from '@/types/mods'

interface UpdatingModCardProps {
  mod: UpdatingMod
  onCancel?: (modId: number) => void
  onDismiss?: (modId: number) => void
}

export function UpdatingModCard({ mod, onCancel, onDismiss }: UpdatingModCardProps) {
  const getStatusText = () => {
    return 'Updating...'
  }

  const isCompleted = mod.progress === 100

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-background shadow-lg min-w-80">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium truncate">{mod.name}</span>
          <Badge variant={isCompleted ? 'secondary' : 'secondary'} className="text-xs">
            {getStatusText()}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground mb-2">{mod.version && `v${mod.version}`}</div>

        {!isCompleted && <Progress value={mod.progress} className="h-2" />}
      </div>

      <div className="flex items-center gap-1">
        {!isCompleted && onCancel && (
          <Button variant="ghost" size="sm" onClick={() => onCancel(mod.id)} className="size-6 p-0">
            <IconX className="size-3" />
          </Button>
        )}

        {isCompleted && onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(mod.id)}
            className="size-6 p-0"
          >
            <IconX className="size-3" />
          </Button>
        )}
      </div>
    </div>
  )
}
