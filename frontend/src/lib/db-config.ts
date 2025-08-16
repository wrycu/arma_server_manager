import { createCollection, type Collection as TanStackCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { queryClient } from './query-client'
import { collections, server, mods } from '@/services'
import { handleApiError } from './error-handler'
import type { Collection } from '@/types/collections'
import type {
  ServerStatusResponse,
  ServerConfigResponse,
  ModSubscription,
  CollectionResponse,
} from '@/types/api'

// Transform API response to local types
const transformApiCollections = (collections: CollectionResponse[]): Collection[] => {
  return collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    description: collection.description || '',
    mods: collection.mods.map((modEntry) => ({
      id: modEntry.mod?.id || modEntry.id,
      name: modEntry.mod?.name || `Mod ${modEntry.mod_id}`,
      version: modEntry.mod?.last_updated || 'Unknown',
      size: `${Math.round((modEntry.mod?.size_bytes || 0) / 1024 / 1024)} MB`,
      type: (modEntry.mod?.mod_type as 'mod' | 'mission' | 'map') || 'mod',
      isServerMod: modEntry.mod?.server_mod || false,
      shouldUpdate: modEntry.mod?.should_update || false,
      disabled: false, // TODO: Remove when API supports mod disabling - always false for now
      lastUpdated: modEntry.mod?.last_updated || '',
      sizeBytes: modEntry.mod?.size_bytes || 0,
      serverMod: modEntry.mod?.server_mod || false,
    })),
    createdAt: collection.created_at,
    isActive: false, // TODO: Add isActive support when API provides it
  }))
}

// Create the collections collection
export const collectionsCollection: TanStackCollection<Collection> = createCollection(
  queryCollectionOptions<Collection>({
    queryKey: ['collections'],
    queryClient,
    queryFn: async () => {
      console.log('🔄 Fetching collections from API...')
      const apiCollections = await collections.getCollections()
      return transformApiCollections(apiCollections)
    },
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
      // Handle optimistic inserts by calling the API
      try {
        for (const mutation of transaction.mutations) {
          await collections.createCollection({
            name: mutation.modified.name,
            description: mutation.modified.description,
          })
        }
      } catch (error) {
        handleApiError(error, 'Failed to create collection')
        throw error // Re-throw to let TanStack DB handle rollback
      }
    },
    onUpdate: async ({ transaction }) => {
      // Handle optimistic updates by calling the API
      try {
        for (const mutation of transaction.mutations) {
          await collections.updateCollection(mutation.modified.id, {
            name: mutation.modified.name,
            description: mutation.modified.description,
            mods: mutation.modified.mods.map((mod) => mod.id),
          })
        }
      } catch (error) {
        handleApiError(error, 'Failed to update collection')
        throw error // Re-throw to let TanStack DB handle rollback
      }
    },
    onDelete: async ({ transaction }) => {
      // Handle optimistic deletes by calling the API
      try {
        for (const mutation of transaction.mutations) {
          await collections.deleteCollection(mutation.original.id)
        }
      } catch (error) {
        handleApiError(error, 'Failed to delete collection')
        throw error // Re-throw to let TanStack DB handle rollback
      }
    },
  })
)

// Create the server collection
export const serverCollection: TanStackCollection<ServerStatusResponse> = createCollection(
  queryCollectionOptions<ServerStatusResponse>({
    queryKey: ['server'],
    queryClient,
    queryFn: async () => {
      console.log('🔄 Fetching server status from API...')
      const serverStatus = await server.getServerStatus()
      return [serverStatus] // Return as array since collection expects array
    },
    getKey: (item) => item.id,
    onUpdate: async ({ transaction }) => {
      // Handle optimistic updates by calling the API
      for (const mutation of transaction.mutations) {
        // For server actions, we don't update the status directly
        // The status is updated by the server action API calls
        console.log('Server status updated:', mutation.modified)
      }
    },
  })
)

// Create the server config collection
export const serverConfigCollection: TanStackCollection<ServerConfigResponse> = createCollection(
  queryCollectionOptions<ServerConfigResponse>({
    queryKey: ['server-config'],
    queryClient,
    queryFn: async () => {
      console.log('🔄 Fetching server config from API...')
      const serverConfig = await server.getServerConfig()
      return [serverConfig] // Return as array since collection expects array
    },
    getKey: (item) => item.id,
    onUpdate: async ({ transaction }) => {
      // Handle optimistic updates by calling the API
      for (const mutation of transaction.mutations) {
        await server.updateServerConfig({
          name: mutation.modified.name,
          port: mutation.modified.port,
          maxPlayers: mutation.modified.maxPlayers,
          password: mutation.modified.password,
          adminPassword: mutation.modified.adminPassword,
          serverPassword: mutation.modified.serverPassword,
          mission: mutation.modified.mission,
          difficulty: mutation.modified.difficulty,
          timeLimit: mutation.modified.timeLimit,
          autoRestart: mutation.modified.autoRestart,
          autoRestartTime: mutation.modified.autoRestartTime,
          mods: mutation.modified.mods,
          customParams: mutation.modified.customParams,
        })
      }
    },
  })
)

// Create the mods collection
export const modsCollection: TanStackCollection<ModSubscription> = createCollection(
  queryCollectionOptions<ModSubscription>({
    queryKey: ['mods'],
    queryClient,
    queryFn: async () => {
      console.log('🔄 Fetching mod subscriptions from API...')
      const modSubscriptions = await mods.getModSubscriptions()
      return modSubscriptions
    },
    getKey: (item) => item.steam_id,
    onInsert: async ({ transaction }) => {
      // Handle optimistic inserts by calling the API
      for (const mutation of transaction.mutations) {
        await mods.addModSubscriptions([{ steam_id: mutation.modified.steam_id }])
      }
    },
    onUpdate: async ({ transaction }) => {
      // Handle optimistic updates by calling the API
      for (const mutation of transaction.mutations) {
        await mods.updateModSubscription(mutation.modified.steam_id, {
          name: mutation.modified.name,
          status: mutation.modified.status,
        })
      }
    },
    onDelete: async ({ transaction }) => {
      // Handle optimistic deletes by calling the API
      for (const mutation of transaction.mutations) {
        await mods.removeModSubscription(mutation.original.steam_id)
      }
    },
  })
)
