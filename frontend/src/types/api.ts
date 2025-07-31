// Shared API types for Arma Server Manager

export interface Mod {
  id: number;
  steam_id?: number;
  filename: string;
  name: string;
  version?: string;
  mod_type: 'mod' | 'mission' | 'map';
  local_path?: string;
  arguments?: string;
  server_mod: boolean;
  size_bytes?: number;
  last_updated?: string;
  steam_last_updated?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateModRequest {
  steam_id?: number;
  filename: string;
  name: string;
  version?: string;
  mod_type?: 'mod' | 'mission' | 'map';
  local_path?: string;
  arguments?: string;
  server_mod?: boolean;
}

export interface Collection {
  id: number;
  name: string;
  description?: string;
  mod_count: number;
  created_at: string;
  updated_at: string;
  mods?: ModCollectionEntry[];
}

export interface ModCollectionEntry {
  id: number;
  collection_id: number;
  mod_id: number;
  arguments?: string;
  added_at: string;
  mod?: Mod;
}

export interface CreateCollectionRequest {
  name: string;
  description?: string;
}

export interface ServerConfig {
  id: number;
  name: string;
  description?: string;
  server_name: string;
  password?: string;
  admin_password?: string;
  max_players: number;
  mission_file?: string;
  server_config_file?: string;
  basic_config_file?: string;
  server_mods?: string;
  client_mods?: string;
  additional_params?: string;
  auto_restart: boolean;
  restart_interval_hours?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServerConfigRequest {
  name: string;
  description?: string;
  server_name: string;
  password?: string;
  admin_password: string;
  max_players?: number;
  mission_file?: string;
  server_config_file?: string;
  basic_config_file?: string;
  server_mods?: string;
  client_mods?: string;
  additional_params?: string;
  auto_restart?: boolean;
  restart_interval_hours?: number;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ModsResponse {
  mods: Mod[];
  pagination: PaginationInfo;
}

export interface CollectionsResponse {
  collections: Collection[];
  pagination: PaginationInfo;
}

export interface ServerConfigsResponse {
  server_configs: ServerConfig[];
  pagination: PaginationInfo;
}
