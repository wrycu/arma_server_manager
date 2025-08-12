import { useState, useRef, useEffect } from 'react'
import { Drawer, DrawerContent, DrawerOverlay, DrawerPortal } from '@/components/ui/drawer'

interface TerminalConsoleProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
}

export function TerminalConsole({ open, onOpenChange }: TerminalConsoleProps) {
  const [logs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date(),
      level: 'info',
      message: 'Server console initialized...',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 5000),
      level: 'info',
      message: 'Arma 3 Server Manager v1.0.0',
    },
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-white'
      case 'warn':
        return 'text-white'
      case 'debug':
        return 'text-white/60'
      default:
        return 'text-white'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerPortal>
        <DrawerOverlay />
        <DrawerContent className="h-80 border-white/10 shadow-2xl bg-black rounded-t-xl">
          {/* Black container that fills the drawer */}
          <div className="h-full text-white relative flex flex-col">
            <div className="flex-1 flex flex-col min-h-0">
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-1 text-xs leading-relaxed font-mono"
              >
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <span className="text-white/60 shrink-0 w-20 tabular-nums">
                      {formatTimestamp(log.timestamp)}
                    </span>
                    <span
                      className={`shrink-0 w-12 uppercase font-medium ${getLevelColor(log.level)}`}
                    >
                      [{log.level}]
                    </span>
                    <span className="text-white">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  )
}
