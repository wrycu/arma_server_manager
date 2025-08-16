// Frontend-specific types (local UI state)
export interface ModItem {
  readonly id: number
  readonly name: string
  readonly version?: string
  readonly size: string // Formatted size string (e.g. "150 MB")
  readonly type: 'mod' | 'mission' | 'map'
  readonly isServerMod: boolean
  readonly shouldUpdate: boolean
  readonly lastUpdated: string
  readonly disabled: boolean
  readonly sizeBytes: number // Raw bytes from API
}

export interface Collection {
  readonly id: number
  readonly createdAt: string
  name: string
  description: string
  mods: ModItem[]
  isActive: boolean
}

export interface UpdatingMod {
  readonly id: number
  readonly name: string
  readonly version?: string
  readonly progress: number
}

export interface NewCollection {
  readonly name: string
  readonly description: string
  readonly mods?: ModItem[]
}

export interface ModToRemove {
  readonly collectionId: number
  readonly modId: number
  readonly modName: string
}
