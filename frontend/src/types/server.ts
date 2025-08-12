export interface ServerStatus {
  name: string
  status: 'online' | 'offline' | 'starting' | 'stopping'
  uptime?: number
  players: number
  maxPlayers: number
  mission?: string
  lastRestart?: string
  cpu: number
  memory: number
  mods: number
  version: string
  activeCollection?: {
    id: number
    name: string
  }
}

export interface ServerMetrics {
  timestamp: number
  players: number
  cpu: number
  memory: number
}

export type ServerAction = 'start' | 'stop' | 'restart'

export interface ServerActionWithCollection {
  action: ServerAction
  collectionId?: number
}

// Schedule-related types
export type ScheduleOperationType = 'restart' | 'backup' | 'mod_update' | 'stop' | 'start'

export type ScheduleStatus = 'active' | 'inactive' | 'paused'

export interface Schedule {
  id: number
  name: string
  description?: string
  operationType: ScheduleOperationType
  frequency: string // Natural language like "every 2 hours", "daily at 3am"
  cronExpression: string // Generated cron expression for backend
  nextRun: string // ISO date string
  lastRun?: string // ISO date string
  status: ScheduleStatus
  operationData?: {
    collectionId?: number // For restart with collection or collection_switch
    customCommand?: string // For custom commands
    parameters?: Record<string, unknown> // Additional parameters
  }
  createdAt: string
  updatedAt: string
}
