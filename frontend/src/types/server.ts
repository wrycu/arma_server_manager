// ----- Backend-aligned server config types (arma3/server endpoints) -----
import type { CollectionResponse } from '@/types/api'

/**
 * Creator DLC codes used by the backend.
 * Note: Some codes differ from Arma 3's official codes:
 * - pf (backend) = vn (Arma 3) - S.O.G. Prairie Fire
 * - ic (backend) = csla (Arma 3) - CSLA Iron Curtain
 * - sh (backend) = spe (Arma 3) - Spearhead 1944
 */
export type CreatorDLCCode = 'pf' | 'gm' | 'ic' | 'ws' | 'sh' | 'rf' | 'ef'

export interface CreatorDLCSettings {
  pf: boolean // S.O.G. Prairie Fire
  gm: boolean // Global Mobilization
  ic: boolean // CSLA Iron Curtain
  ws: boolean // Western Sahara
  sh: boolean // Spearhead 1944
  rf: boolean // Reaction Forces
  ef: boolean // Expeditionary Forces
}

export const CREATOR_DLC_INFO: Record<CreatorDLCCode, { name: string; description: string }> = {
  pf: { name: 'S.O.G. Prairie Fire', description: 'Vietnam War expansion' },
  gm: { name: 'Global Mobilization', description: 'Cold War Germany expansion' },
  ic: { name: 'CSLA Iron Curtain', description: 'Czechoslovak Army expansion' },
  ws: { name: 'Western Sahara', description: 'North African conflict expansion' },
  sh: { name: 'Spearhead 1944', description: 'World War II expansion' },
  rf: { name: 'Reaction Forces', description: 'Modern military expansion' },
  ef: { name: 'Expeditionary Forces', description: 'Expeditionary warfare expansion' },
}

export const DEFAULT_CREATOR_DLC_SETTINGS: CreatorDLCSettings = {
  pf: false,
  gm: false,
  ic: false,
  ws: false,
  sh: false,
  rf: false,
  ef: false,
}

export interface ServerResources {
  cpu_usage_percent: number
  ram_usage_percent: number
  uptime_in_seconds: number
}

export interface ServerConfig {
  id: number
  name: string
  description: string | null
  server_name: string
  max_players: number
  mission_file: string | null
  server_config_file: string | null
  basic_config_file: string | null
  server_mods?: string | null
  client_mods?: string | null
  additional_params: string | null
  server_binary: string
  collection_id: number | null
  collection: CollectionResponse | Record<string, never> | null
  activeCollection?: {
    id: number
    name: string
  } | null
  is_active: boolean
  use_headless_client: boolean
  headless_client_active: boolean
  resources: ServerResources
  created_at: string
  updated_at: string
  load_creator_dlc: CreatorDLCSettings
  // Sensitive (optional, only returned when include_sensitive=true)
  password?: string | null
  admin_password?: string | null
}

export interface CreateServerRequest {
  name: string
  description: string | null
  server_name: string
  password?: string | null
  admin_password: string
  max_players: number
  mission_file?: string | null
  server_config_file?: string | null
  basic_config_file?: string | null
  server_mods?: string | null
  client_mods?: string | null
  additional_params?: string | null
  server_binary: string
  load_creator_dlc?: Partial<CreatorDLCSettings>
}

export type UpdateServerRequest = Partial<CreateServerRequest>

// ----- Schedule types (matches backend arma3.py schedule endpoints) -----
export interface TaskLogEntry {
  id: number
  schedule_id: number | null
  message: string
  message_level: string
  received_at: string
}

export interface Schedule {
  id: number
  name: string
  celery_name: string
  action: string
  enabled: boolean
  created_at: string
  updated_at: string
  last_outcome?: string | null
  last_run?: string | null
  log_entries?: TaskLogEntry[]
}

export interface CreateScheduleRequest {
  name: string
  celery_name: string
  action: string
  enabled: boolean
}

export type UpdateScheduleRequest = Partial<CreateScheduleRequest>

// Legacy types for UI compatibility - these map to the actual backend fields
export type ScheduleOperationType = 'restart' | 'backup' | 'mod_update' | 'stop' | 'start'
export type ScheduleStatus = 'active' | 'inactive' | 'paused'
