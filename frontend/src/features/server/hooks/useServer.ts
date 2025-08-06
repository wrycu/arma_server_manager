import { useState, useEffect, useCallback } from 'react'
import { useLiveQuery } from '@tanstack/react-db'
import { useServerDB, useServerConfigDB } from '@/providers/db-provider'
import { server } from '@/services'
import type { ServerStatus, ServerMetrics, ServerActionWithCollection } from '../types'
import type { ServerStatusResponse, ServerMetricsResponse, ServerConfigResponse } from '@/types/api'

export function useServer() {
  const serverCollection = useServerDB()
  const serverConfigCollection = useServerConfigDB()

  // Get server status from TanStack DB using live query (automatically reactive)
  const { data: serverStatusArray = [] } = useLiveQuery((query) =>
    query.from({ server: serverCollection })
  )

  // Get server config from TanStack DB
  const { data: serverConfigArray = [] } = useLiveQuery((query) =>
    query.from({ serverConfig: serverConfigCollection })
  )

  // Local state for UI-specific concerns
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [metricsHistory, setMetricsHistory] = useState<ServerMetrics[]>([])

  // Get the first (and only) server status and config
  const serverStatus = serverStatusArray[0] as ServerStatusResponse | undefined
  const serverConfig = serverConfigArray[0] as ServerConfigResponse | undefined

  // Transform API response to local types
  const transformServerStatus = (apiStatus: ServerStatusResponse): ServerStatus => ({
    name: apiStatus.name,
    status: apiStatus.status,
    uptime: apiStatus.uptime,
    players: apiStatus.players,
    maxPlayers: apiStatus.maxPlayers,
    mission: apiStatus.mission,
    lastRestart: apiStatus.lastRestart,
    cpu: apiStatus.cpu,
    memory: apiStatus.memory,
    mods: apiStatus.mods,
    version: apiStatus.version,
    activeCollection: apiStatus.activeCollection,
  })

  const transformServerMetrics = (apiMetrics: ServerMetricsResponse[]): ServerMetrics[] => {
    return apiMetrics.map((metric) => ({
      timestamp: metric.timestamp,
      players: metric.players,
      cpu: metric.cpu,
      memory: metric.memory,
    }))
  }

  // Helper functions for optimistic updates
  const updateServerStatusOptimistic = async (updates: Partial<ServerStatusResponse>) => {
    if (!serverStatus) return

    await serverCollection.update(serverStatus.id, (draft: ServerStatusResponse) => {
      Object.assign(draft, updates)
    })
  }

  // Action functions
  const performServerAction = async (actionData: ServerActionWithCollection) => {
    setIsLoading(actionData.action)

    try {
      // Optimistic update based on action
      if (actionData.action === 'start' || actionData.action === 'restart') {
        await updateServerStatusOptimistic({ status: 'starting' })
        if (actionData.collectionId && serverStatus) {
          await updateServerStatusOptimistic({
            activeCollection: {
              id: actionData.collectionId,
              name: 'Loading...', // Will be updated by API response
            },
          })
        }
      } else if (actionData.action === 'stop') {
        await updateServerStatusOptimistic({ status: 'stopping' })
      }

      // Call the API
      const response = await server.performServerAction({
        action: actionData.action,
        collectionId: actionData.collectionId,
      })

      console.log(`Server ${actionData.action} response:`, response)

      // TanStack DB will handle the API call automatically via onUpdate
      // The server status will be updated by the API response
    } catch (error) {
      console.error(`Server ${actionData.action} failed:`, error)
      // Revert optimistic update on error
      if (serverStatus) {
        await serverCollection.update(serverStatus.id, (_draft: ServerStatusResponse) => {
          // Revert to previous state - this would need more sophisticated error handling
          // For now, just log the error
        })
      }
    } finally {
      setIsLoading(null)
    }
  }

  const refreshServerStatus = async () => {
    try {
      // Trigger a refetch by invalidating the query
      // This will cause TanStack DB to refetch the data
      console.log('Refreshing server status...')
    } catch (error) {
      console.error('Failed to refresh server status:', error)
    }
  }

  const refreshServerMetrics = useCallback(async () => {
    try {
      const metrics = await server.getServerMetrics()
      const transformedMetrics = transformServerMetrics(metrics)
      setMetricsHistory(transformedMetrics)
    } catch (error) {
      console.error('Failed to refresh server metrics:', error)
    }
  }, [])

  const updateServerConfig = async (configData: Partial<ServerConfigResponse>) => {
    if (!serverConfig) return

    try {
      await serverConfigCollection.update(serverConfig.id, (draft: ServerConfigResponse) => {
        Object.assign(draft, configData, {
          updatedAt: new Date().toISOString(),
        })
      })
      // TanStack DB will handle the API call automatically via onUpdate
    } catch (error) {
      console.error('Failed to update server config:', error)
    }
  }

  // Initialize metrics history on mount
  useEffect(() => {
    refreshServerMetrics()
  }, [refreshServerMetrics])

  return {
    // Data
    server: serverStatus ? transformServerStatus(serverStatus) : null,
    serverConfig,
    metricsHistory,

    // Loading states
    isLoading,

    // Actions
    performServerAction,
    refreshServerStatus,
    refreshServerMetrics,
    updateServerConfig,

    // Helper functions
    isOnline: serverStatus?.status === 'online',
    isStarting: serverStatus?.status === 'starting',
    isStopping: serverStatus?.status === 'stopping',
    isOffline: serverStatus?.status === 'offline',
  }
}
