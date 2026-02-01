export interface NotificationSettings {
  enableNotifications: boolean
  webhookUrl: string
  notificationTypes: {
    serverStartStop: boolean
    modUpdates: boolean
    playerEvents: boolean
  }
}

import type { CreatorDLCSettings } from '@/types/server'

export interface ServerConfiguration {
  name: string
  description: string
  server_name: string
  password: string
  admin_password: string
  max_players: number
  mission_file: string
  server_config_file: string
  basic_config_file: string
  server_mods: string
  client_mods: string
  additional_params: string
  server_binary: string
  load_creator_dlc: CreatorDLCSettings
}

export interface SecuritySettings {
  adminPassword: string
  enableLogging: boolean
}

export interface SettingsData {
  notifications: NotificationSettings
  server?: ServerConfiguration
}
