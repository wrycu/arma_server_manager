import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '@/services'
import { handleApiError } from '@/lib/error-handler'
import type {
  ServerStatus,
  ServerMetrics,
  ServerActionWithCollection,
} from '../../../types/server.ts'
import type { ServerStatusResponse, ServerMetricsResponse, ServerConfigResponse } from '@/types/api'

export function useServer() {
  const queryClient = useQueryClient()

  // Local state for UI-specific concerns
  const [metricsHistory, setMetricsHistory] = useState<ServerMetrics[]>([])

  // Fetch server status using React Query
  const {
    data: serverStatus,
    isLoading: isServerStatusLoading,
    error: serverStatusError,
  } = useQuery({
    queryKey: ['server-status'],
    queryFn: async () => {
      console.log('🔄 Fetching server status from API...')
      return await server.getServerStatus()
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  // Fetch server config using React Query
  const {
    data: serverConfig,
    isLoading: isServerConfigLoading,
    error: serverConfigError,
  } = useQuery({
    queryKey: ['server-config'],
    queryFn: async () => {
      console.log('🔄 Fetching server config from API...')
      return await server.getServerConfig()
    },
  })

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

  // Mutations
  const serverActionMutation = useMutation({
    mutationFn: async (actionData: ServerActionWithCollection) => {
      return await server.performServerAction({
        action: actionData.action,
        collectionId: actionData.collectionId,
      })
    },
    onSuccess: (response, actionData) => {
      console.log(`Server ${actionData.action} response:`, response)
      // Invalidate server status to get fresh data
      queryClient.invalidateQueries({ queryKey: ['server-status'] })
    },
    onError: (error, actionData) => {
      handleApiError(error, `Failed to ${actionData.action} server`)
    },
  })

  const updateServerConfigMutation = useMutation({
    mutationFn: async (configData: Partial<ServerConfigResponse>) => {
      return await server.updateServerConfig(configData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server-config'] })
    },
    onError: (error) => {
      handleApiError(error, 'Failed to update server config')
    },
  })

  // Action functions
  const performServerAction = async (actionData: ServerActionWithCollection) => {
    try {
      await serverActionMutation.mutateAsync(actionData)
    } catch (error) {
      console.error(`Server ${actionData.action} failed:`, error)
    }
  }

  const refreshServerStatus = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['server-status'] })
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
    try {
      await updateServerConfigMutation.mutateAsync(configData)
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
    isLoading: serverActionMutation.isPending,
    isServerStatusLoading,
    isServerConfigLoading,

    // Error states
    serverStatusError,
    serverConfigError,

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
