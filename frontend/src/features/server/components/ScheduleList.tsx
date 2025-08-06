import { Play, Trash2, Edit3, MoreVertical, Calendar } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import type { Schedule } from '../types'

interface ScheduleListProps {
  schedules: Schedule[]
  isLoading?: boolean
  onToggleSchedule?: (id: number, enabled: boolean) => void
  onExecuteSchedule?: (id: number) => void
  onEditSchedule?: (schedule: Schedule) => void
  onDeleteSchedule?: (id: number) => void
}

function formatNextRun(nextRun: string): string {
  const date = new Date(nextRun)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()

  if (diffMs < 0) return 'Overdue'

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays}d`
  if (diffHours > 0) return `${diffHours}h`
  return `${Math.floor(diffMs / (1000 * 60))}m`
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const operationTypes = {
  restart: 'Restart',
  backup: 'Backup',
  mod_update: 'Update',
  stop: 'Stop',
  start: 'Start',
} as const

export function ScheduleList({
  schedules,
  isLoading = false,
  onToggleSchedule,
  onExecuteSchedule,
  onEditSchedule,
  onDeleteSchedule,
}: ScheduleListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-muted/30 rounded-sm animate-pulse" />
        ))}
      </div>
    )
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No schedules configured</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {schedules.map(schedule => {
        const isActive = schedule.status === 'active'
        const isPaused = schedule.status === 'paused'
        const isOverdue = schedule.nextRun && new Date(schedule.nextRun) < new Date()

        return (
          <div
            key={schedule.id}
            className={`group flex items-center gap-3 p-3 rounded-sm border border-transparent hover:border-border hover:bg-muted/30 transition-colors ${!isActive ? 'opacity-60' : ''}`}
          >
            <Checkbox
              checked={isActive}
              onCheckedChange={checked => onToggleSchedule?.(schedule.id, !!checked)}
              disabled={isPaused}
              className="shrink-0 h-4 w-4"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm truncate">{schedule.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {operationTypes[schedule.operationType]}
                </span>
                {isPaused && (
                  <span className="text-xs text-muted-foreground">• Paused</span>
                )}
                {isOverdue && isActive && (
                  <span className="text-xs text-destructive">• Overdue</span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <span>{schedule.frequency}</span>

                {schedule.nextRun && (
                  <span>
                    Next: {formatDateTime(schedule.nextRun)}
                    <span className={`ml-1 ${isOverdue ? 'text-destructive' : ''}`}>
                      ({formatNextRun(schedule.nextRun)})
                    </span>
                  </span>
                )}

                {schedule.operationData?.collectionId && (
                  <span>Collection: {schedule.operationData.collectionId}</span>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onExecuteSchedule?.(schedule.id)}>
                  <Play className="h-4 w-4 mr-2" />
                  Execute Now
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditSchedule?.(schedule)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDeleteSchedule?.(schedule.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      })}
    </div>
  )
}
