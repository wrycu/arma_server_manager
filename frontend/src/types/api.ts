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

// Mod subscription API types - matches backend Mod model
export interface ModSubscriptionResponse {
  readonly id: number
  readonly steam_id: number
  readonly filename: string
  readonly name: string
  readonly mod_type: string | null
  readonly local_path: string | null
  readonly server_mod: boolean
  readonly size_bytes: number | null
  readonly last_updated: string | null
  readonly steam_last_updated: string | null
  readonly should_update: boolean
  readonly image_available?: boolean
}

export interface ModSubscriptionsResponse {
  results: ModSubscriptionResponse[]
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
  results: ModSubscriptionResponse
  message: string
}

export interface UpdateModSubscriptionRequest {
  readonly filename?: string
  readonly name?: string
  readonly mod_type?: 'mod' | 'mission' | 'map'
  readonly local_path?: string
  readonly server_mod?: boolean
  readonly should_update?: boolean
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

// Steam Collection API types
export interface SteamCollectionResponse {
  results: number[] // Array of Steam Workshop item IDs
  message: string
}

// Collections API types
// Note: ModResponse is the same as ModSubscriptionResponse - they represent the same backend Mod model
export type ModResponse = ModSubscriptionResponse

export interface ModCollectionEntryResponse {
  readonly id: number
  readonly collection_id: number
  readonly mod_id: number
  readonly added_at: string
  readonly mod?: ModSubscriptionResponse
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

// Schedule API types - matches backend arma3.py endpoints
export interface ScheduleResponse {
  id: number
  name: string
  celery_name: string
  action: string
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface SchedulesListResponse {
  results: ScheduleResponse[]
  message: string
}

export interface CreateScheduleRequest {
  name: string
  celery_name: string
  action: string
  enabled: boolean
}

export interface CreateScheduleResponse {
  result: number // Returns the ID of created schedule
  message: string
}

export interface UpdateScheduleRequest {
  name?: string
  celery_name?: string
  action?: string
  enabled?: boolean
}

export interface UpdateScheduleResponse {
  message: string
}

export interface TriggerScheduleResponse {
  message: string
}

// Notification API types - matches backend notification model and /api/notification routes
export interface NotificationApi {
  id: number
  enabled: boolean
  URL: string
  send_server: boolean
  send_mod_update: boolean
  last_run: string | null
  created_at: string | null
  updated_at: string | null
}

export interface NotificationsListResponse {
  results: NotificationApi[]
  message: string
}

export interface NotificationDetailsResponse {
  results: NotificationApi
  message: string
}

export interface CreateNotificationRequest {
  URL: string
  enabled: boolean
  send_server?: boolean
  send_mod_update?: boolean
}

export interface CreateNotificationResponse {
  result: number
  message: string
}

export interface UpdateNotificationRequest {
  URL?: string
  enabled?: boolean
  send_server?: boolean
  send_mod_update?: boolean
}

export interface UpdateNotificationResponse {
  message: string
}
