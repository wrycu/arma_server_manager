import { createCollection } from "@tanstack/react-db"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { queryClient } from "./query-client"
import { collections, server, mods } from "@/services"
import type { Collection } from "@/features/collections/types"
import type { CollectionResponse } from "@/types/api"
import type {
  ServerStatusResponse,
  ServerConfigResponse,
  ModSubscription,
} from "@/types/api"

// Transform API response to local types
const transformApiCollections = (
  apiCollections: CollectionResponse[],
): Collection[] => {
  return apiCollections.map(apiCollection => ({
    id: apiCollection.id,
    name: apiCollection.name,
    description: apiCollection.description,
    mods: apiCollection.mods.map(mod => ({
      id: mod.id,
      name: mod.name,
      version: mod.version,
      size: mod.size,
      type: mod.type,
      isServerMod: mod.isServerMod,
      hasUpdate: mod.hasUpdate,
      disabled: mod.disabled,
    })),
    createdAt: apiCollection.createdAt,
    isActive: apiCollection.isActive,
  }))
}

// Create the collections collection
export const collectionsCollection = createCollection(
  queryCollectionOptions<Collection>({
    queryKey: ["collections"],
    queryClient,
    queryFn: async () => {
      console.log("🔄 Fetching collections from API...")
      const apiCollections = await collections.getCollections()
      return transformApiCollections(apiCollections)
    },
    getKey: item => item.id,
    onInsert: async ({ transaction }) => {
      // Handle optimistic inserts by calling the API
      for (const mutation of transaction.mutations) {
        await collections.createCollection({
          name: mutation.modified.name,
          description: mutation.modified.description,
        })
      }
    },
    onUpdate: async ({ transaction }) => {
      // Handle optimistic updates by calling the API
      for (const mutation of transaction.mutations) {
        await collections.updateCollection(mutation.modified.id, {
          name: mutation.modified.name,
          description: mutation.modified.description,
          isActive: mutation.modified.isActive,
          mods: mutation.modified.mods, // Include mods array to persist mod changes
        })
      }
    },
    onDelete: async ({ transaction }) => {
      // Handle optimistic deletes by calling the API
      for (const mutation of transaction.mutations) {
        await collections.deleteCollection(mutation.original.id)
      }
    },
  }),
)

// Create the server collection
export const serverCollection = createCollection(
  queryCollectionOptions<ServerStatusResponse>({
    queryKey: ["server"],
    queryClient,
    queryFn: async () => {
      console.log("🔄 Fetching server status from API...")
      const serverStatus = await server.getServerStatus()
      return [serverStatus] // Return as array since collection expects array
    },
    getKey: item => item.id,
    onUpdate: async ({ transaction }) => {
      // Handle optimistic updates by calling the API
      for (const mutation of transaction.mutations) {
        // For server actions, we don't update the status directly
        // The status is updated by the server action API calls
        console.log("Server status updated:", mutation.modified)
      }
    },
  }),
)

// Create the server config collection
export const serverConfigCollection = createCollection(
  queryCollectionOptions<ServerConfigResponse>({
    queryKey: ["server-config"],
    queryClient,
    queryFn: async () => {
      console.log("🔄 Fetching server config from API...")
      const serverConfig = await server.getServerConfig()
      return [serverConfig] // Return as array since collection expects array
    },
    getKey: item => item.id,
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
  }),
)

// Create the mods collection
export const modsCollection = createCollection(
  queryCollectionOptions<ModSubscription>({
    queryKey: ["mods"],
    queryClient,
    queryFn: async () => {
      console.log("🔄 Fetching mod subscriptions from API...")
      const modSubscriptions = await mods.getModSubscriptions()
      return modSubscriptions
    },
    getKey: item => item.steam_id,
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
  }),
)
