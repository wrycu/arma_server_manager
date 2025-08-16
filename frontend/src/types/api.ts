// API types for Arma Server Manager
// Contains only types for endpoints that actually exist in the backend

// Arma3 API specific types

export interface ModHelper {
  description: string
  file_size: string
  preview_url: string
  tags: string[]
  time_updated: string
  title: string
}

export interface ModHelperResponse {
  results: ModHelper
  message: string
}

export interface ModSubscription {
  steam_id: number
  // Add other subscription properties based on actual backend model
  name?: string
  status?: string
  last_updated?: string
  type?: 'mod' | 'mission' | 'map'
}

export interface ModSubscriptionsResponse {
  results: ModSubscription[]
  message: string
}

export interface AddModSubscriptionRequest {
  mods: Array<{
    steam_id: number
  }>
}

export interface AddModSubscriptionResponse {
  message: string
  ids: number[]
}

export interface ModSubscriptionDetailsResponse {
  results: ModSubscription
  message: string
}

export interface UpdateModSubscriptionRequest {
  // Define based on what fields can be updated
  name?: string
  status?: string
  [key: string]: string | number | boolean | undefined
}

export interface ModDownloadResponse {
  status: string // job_id
  message: string
}

export interface AsyncJobStatusResponse {
  status: string
  message: string
}

export interface AsyncJobSuccessResponse {
  // The result structure when job is successful
  [key: string]: string | number | boolean | object | undefined
}

// Collections API types
export interface ModResponse {
  readonly id: number
  readonly steam_id: number
  readonly filename: string
  readonly name: string
  readonly mod_type: string | null
  readonly local_path: string
  readonly arguments: string
  readonly server_mod: boolean
  readonly size_bytes: number
  readonly last_updated: string | null
  readonly steam_last_updated: string | null
  readonly should_update: boolean
}

export interface ModCollectionEntryResponse {
  readonly id: number
  readonly collection_id: number
  readonly mod_id: number
  readonly added_at: string
  readonly mod?: ModResponse
}

export interface CollectionResponse {
  readonly id: number
  readonly name: string
  readonly description: string | null
  readonly mod_count: number
  readonly mods: ModCollectionEntryResponse[]
  readonly created_at: string
  readonly updated_at: string
}

export interface CollectionsListResponse {
  readonly results: CollectionResponse[]
  readonly message: string
}

export interface CollectionDetailsResponse {
  readonly results: CollectionResponse
  readonly message: string
}

export interface CreateCollectionRequest {
  readonly name: string
  readonly description: string
  readonly mods?: number[] // Optional array of mod IDs
}

export interface CreateCollectionResponse {
  readonly result: number // Returns the ID of created collection
  readonly message: string
}

export interface UpdateCollectionRequest {
  readonly name?: string
  readonly description?: string
  readonly mods?: number[]
}

export interface UpdateCollectionResponse {
  readonly message: string
}

export interface AddModToCollectionRequest {
  readonly mods: number[]
}

export interface AddModToCollectionResponse {
  readonly message: string
}

export interface RemoveModFromCollectionRequest {
  readonly mods: number[]
}

export interface RemoveModFromCollectionResponse {
  readonly message: string
}

export interface DeleteCollectionResponse {
  readonly message: string
}

// Server API types
export interface ServerStatusResponse {
  id: number
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

export interface ServerMetricsResponse {
  timestamp: number
  players: number
  cpu: number
  memory: number
}

export interface ServerMetricsHistoryResponse {
  results: ServerMetricsResponse[]
  message: string
}

export interface ServerActionRequest {
  action: 'start' | 'stop' | 'restart'
  collectionId?: number
}

export interface ServerActionResponse {
  message: string
  status: string
}

export interface ServerConfigResponse {
  id: number
  name: string
  port: number
  maxPlayers: number
  password?: string
  adminPassword?: string
  serverPassword?: string
  mission: string
  difficulty: string
  timeLimit: number
  autoRestart: boolean
  autoRestartTime: number
  mods: string[]
  customParams: string[]
  createdAt: string
  updatedAt: string
}

export interface UpdateServerConfigRequest {
  name?: string
  port?: number
  maxPlayers?: number
  password?: string
  adminPassword?: string
  serverPassword?: string
  mission?: string
  difficulty?: string
  timeLimit?: number
  autoRestart?: boolean
  autoRestartTime?: number
  mods?: string[]
  customParams?: string[]
}

// Schedule API types
export interface ScheduleResponse {
  id: number
  name: string
  description?: string
  operationType: 'restart' | 'backup' | 'mod_update' | 'stop' | 'start'
  frequency: string
  cronExpression: string
  nextRun: string
  lastRun?: string
  status: 'active' | 'inactive' | 'paused'
  operationData?: {
    collectionId?: number
    customCommand?: string
    parameters?: Record<string, unknown>
  }
  createdAt: string
  updatedAt: string
}

export interface SchedulesListResponse {
  results: ScheduleResponse[]
  message: string
}

export interface CreateScheduleRequest {
  name: string
  description?: string
  operationType: 'restart' | 'backup' | 'mod_update' | 'stop' | 'start'
  frequency: string
  operationData?: {
    collectionId?: number
    customCommand?: string
    parameters?: Record<string, unknown>
  }
}

export interface CreateScheduleResponse {
  results: ScheduleResponse
  message: string
}

export interface UpdateScheduleRequest {
  name?: string
  description?: string
  frequency?: string
  status?: 'active' | 'inactive' | 'paused'
  operationData?: {
    collectionId?: number
    customCommand?: string
    parameters?: Record<string, unknown>
  }
}

export interface UpdateScheduleResponse {
  results: ScheduleResponse
  message: string
}
