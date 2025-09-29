// ----- Backend-aligned server config types (arma3/server endpoints) -----
export interface ServerConfig {
  id: number
  name: string
  description: string | null
  server_name: string
  max_players: number
  mission_file: string | null
  server_config_file: string | null
  basic_config_file: string | null
  server_mods: string | null
  client_mods: string | null
  additional_params: string | null
  server_binary: string
  is_active: boolean
  created_at: string
  updated_at: string
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
}

export type UpdateServerRequest = Partial<CreateServerRequest>
