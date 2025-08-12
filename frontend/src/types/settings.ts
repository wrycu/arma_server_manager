export interface NotificationSettings {
  enableNotifications: boolean
  webhookUrl: string
  notificationTypes: {
    serverStartStop: boolean
    modUpdates: boolean
    playerEvents: boolean
  }
}

export interface ServerConfiguration {
  serverName: string
  serverPort: number
  serverPassword: string
  maxPlayers: number
  serverDescription: string
}

export interface SecuritySettings {
  adminPassword: string
  enableLogging: boolean
}

export interface SettingsData {
  notifications: NotificationSettings
  server: ServerConfiguration
  security: SecuritySettings
}

export type SettingsTab = 'notifications' | 'server' | 'security'
