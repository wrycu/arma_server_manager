// Mods feature types
export interface InstalledMod {
  id: number
  steamId: number
  name: string
  author: string
  lastUpdated: string
  type: 'mod' | 'mission' | 'map'
  hasUpdate: boolean
  sizeOnDisk?: string
}

// Extended mod subscription with UI-specific data
export interface ExtendedModSubscription {
  steam_id: number
  name?: string
  status?: string
  last_updated?: string
  author?: string
  type?: 'mod' | 'mission' | 'map'
  hasUpdate?: boolean
  sizeOnDisk?: string
}

export interface UpdatingMod {
  id: number
  name: string
  version?: string
  progress: number
}
