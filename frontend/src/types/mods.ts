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
  readonly size: string // Formatted size string (e.g. "49.503 KB", "1.25 MB", "2.10 GB")
  readonly lastUpdated: string | null
  readonly steamLastUpdated: string | null
  readonly shouldUpdate: boolean
  readonly imageAvailable: boolean
}

// Extended shape used by UI tables (optional fields for display/filtering)
export interface ExtendedModSubscription extends ModSubscription {
  readonly author?: string
  readonly type?: 'mod' | 'mission' | 'map'
  readonly sizeOnDisk?: string
}
