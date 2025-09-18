// Frontend-specific types (local UI state)
import { ModSubscription } from './mods'

export interface Collection {
  readonly id: number
  readonly createdAt: string
  name: string
  description: string
  mods: ModSubscription[]
  isActive: boolean
}


export interface NewCollection {
  readonly name: string
  readonly description: string
  readonly mods?: ModSubscription[]
}

export interface ModToRemove {
  readonly collectionId: number
  readonly modId: number
  readonly modName: string
}
