import React, { createContext, useContext } from 'react'
import {
  collectionsCollection,
  serverCollection,
  serverConfigCollection,
  modsCollection,
} from '@/lib/db-config'
import type { Collection } from '@/types/collections'
import type { Collection as TanStackCollection } from '@tanstack/react-db'
import type { ServerConfigResponse, ServerStatusResponse } from '@/types/api'
import type { ModSubscription } from '@/types/api'

// Create DB context with all collections
const DBContext = createContext({
  collectionsCollection,
  serverCollection,
  serverConfigCollection,
  modsCollection,
})

// Custom hook to use the collections
export function useCollectionsDB(): TanStackCollection<Collection> {
  const context = useContext(DBContext)
  if (!context) {
    throw new Error('useCollectionsDB must be used within a DBProvider')
  }
  return context.collectionsCollection
}

// Custom hook to use the server collection
export function useServerDB(): TanStackCollection<ServerStatusResponse> {
  const context = useContext(DBContext)
  if (!context) {
    throw new Error('useServerDB must be used within a DBProvider')
  }
  return context.serverCollection
}

// Custom hook to use the server config collection
export function useServerConfigDB(): TanStackCollection<ServerConfigResponse> {
  const context = useContext(DBContext)
  if (!context) {
    throw new Error('useServerConfigDB must be used within a DBProvider')
  }
  return context.serverConfigCollection
}

// Custom hook to use the mods collection
export function useModsDB(): TanStackCollection<ModSubscription> {
  const context = useContext(DBContext)
  if (!context) {
    throw new Error('useModsDB must be used within a DBProvider')
  }
  return context.modsCollection
}

interface DBProviderProps {
  children: React.ReactNode
}

export function DBProvider({ children }: DBProviderProps) {
  return (
    <DBContext.Provider
      value={{
        collectionsCollection,
        serverCollection,
        serverConfigCollection,
        modsCollection,
      }}
    >
      {children}
    </DBContext.Provider>
  )
}
