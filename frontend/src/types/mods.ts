// Frontend-specific types (local UI state) - camelCase for consistency
export interface ModSubscription {
  readonly id: number
  readonly steamId: number
  readonly filename: string
  readonly name: string
  readonly modType: 'mod' | 'mission' | 'map' | null
  readonly localPath: string | null
  readonly arguments: string | null
  readonly isServerMod: boolean
  readonly sizeBytes: number | null
  readonly size: string // Formatted size string (e.g. "150 MB")
  readonly lastUpdated: string | null
  readonly steamLastUpdated: string | null
  readonly shouldUpdate: boolean
  readonly imageAvailable: boolean
}

export interface UpdatingMod {
  readonly id: number
  readonly name: string
  readonly version?: string
  readonly progress: number
}
