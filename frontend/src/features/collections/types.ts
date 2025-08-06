export interface ModItem {
  id: number
  name: string
  version?: string
  size: string
  type: 'mod' | 'mission' | 'map'
  isServerMod: boolean
  hasUpdate: boolean
  disabled: boolean
}

export interface Collection {
  id: number
  name: string
  description: string
  mods: ModItem[]
  createdAt: string
  isActive: boolean
}

// UpdatingMod is now imported from mods feature to avoid duplication
export type { UpdatingMod } from '../mods/types'

export interface ModToRemove {
  collectionId: number
  modId: number
  modName: string
}

export interface NewCollection {
  name: string
  description: string
  mods?: ModItem[]
}
