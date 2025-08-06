import React, { createContext, useContext } from 'react'
import {
  collectionsCollection,
  serverCollection,
  serverConfigCollection,
  modsCollection,
} from '@/lib/db-config'

// Create DB context with all collections
const DBContext = createContext({
  collectionsCollection,
  serverCollection,
  serverConfigCollection,
  modsCollection,
})

// Custom hook to use the collections
export function useCollectionsDB() {
  const context = useContext(DBContext)
  if (!context) {
    throw new Error('useCollectionsDB must be used within a DBProvider')
  }
  return context.collectionsCollection
}

// Custom hook to use the server collection
export function useServerDB() {
  const context = useContext(DBContext)
  if (!context) {
    throw new Error('useServerDB must be used within a DBProvider')
  }
  return context.serverCollection
}

// Custom hook to use the server config collection
export function useServerConfigDB() {
  const context = useContext(DBContext)
  if (!context) {
    throw new Error('useServerConfigDB must be used within a DBProvider')
  }
  return context.serverConfigCollection
}

// Custom hook to use the mods collection
export function useModsDB() {
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
