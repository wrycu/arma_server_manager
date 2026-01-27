import { useMemo } from 'react'
import { IconSearch } from '@tabler/icons-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { TaskLogEntry } from '@/types/server'

interface TaskLogsViewerProps {
  logEntries: TaskLogEntry[]
  isLoading?: boolean
  maxHeight?: string
}

/**
 * Displays task log entries from scheduled tasks in a scrollable monospace formatted view.
 */
export function TaskLogsViewer({
  logEntries,
  isLoading = false,
  maxHeight = '300px',
}: TaskLogsViewerProps) {
  // Sort log entries by received_at in descending order (newest first)
  const sortedEntries = useMemo(() => {
    return [...logEntries].sort(
      (a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
    )
  }, [logEntries])

  // Format timestamp for display
  const formatTimestamp = (isoString: string): string => {
    const date = new Date(isoString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  }

  // Get color class based on log level
  const getLevelColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'text-red-400'
      case 'warn':
      case 'warning':
        return 'text-yellow-400'
      case 'info':
        return 'text-blue-400'
      case 'debug':
        return 'text-gray-400'
      default:
        return 'text-foreground'
    }
  }

  // Get badge color based on log level
  const getLevelBadgeColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'bg-red-500/20 text-red-400'
      case 'warn':
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'info':
        return 'bg-blue-500/20 text-blue-400'
      case 'debug':
        return 'bg-gray-500/20 text-gray-400'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    )
  }

  if (sortedEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <IconSearch className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No logs found</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Logs will appear here when scheduled tasks execute
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-muted/30">
      <ScrollArea style={{ height: maxHeight }}>
        <div className="p-4 space-y-1">
          {sortedEntries.map((entry) => (
            <div
              key={entry.id}
              className="font-mono text-xs leading-relaxed flex items-start gap-2"
            >
              {/* Timestamp */}
              <span className="text-muted-foreground whitespace-nowrap shrink-0">
                {formatTimestamp(entry.received_at)}
              </span>

              {/* Level badge */}
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold whitespace-nowrap shrink-0 ${getLevelBadgeColor(entry.message_level)}`}
              >
                {entry.message_level}
              </span>

              {/* Message */}
              <span className={`break-words ${getLevelColor(entry.message_level)}`}>
                {entry.message}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
