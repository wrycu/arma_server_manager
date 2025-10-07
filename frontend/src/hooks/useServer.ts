import { useQuery, useQueryClient } from '@tanstack/react-query'
import { server } from '@/services'
import { handleApiError } from '@/lib/error-handler'
import type { ServerConfig } from '@/types/server'

export function useServer(serverId?: number, includeSensitive: boolean = false) {
  const queryClient = useQueryClient()
  // Servers list (no polling, simple fetch)
  const {
    data: servers,
    isLoading: isServersLoading,
    error: serversError,
  } = useQuery({
    queryKey: ['servers', includeSensitive],
    queryFn: async (): Promise<ServerConfig[]> => {
      try {
        return await server.listServers(includeSensitive)
      } catch (error) {
        handleApiError(error, 'Failed to load servers')
        return []
      }
    },
  })

  // Selected server details (if id is provided)
  const {
    data: selectedServer,
    isLoading: isSelectedServerLoading,
    error: selectedServerError,
  } = useQuery({
    queryKey: ['server', serverId],
    queryFn: async (): Promise<ServerConfig> => {
      if (!serverId) throw new Error('No server id provided')
      return await server.getServer(serverId, true)
    },
    enabled: !!serverId,
  })

  // Utility functions for cache management
  const invalidateServers = () => {
    queryClient.invalidateQueries({ queryKey: ['servers'] })
  }

  const invalidateServer = (id?: number) => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: ['server', id] })
    }
  }

  const refetchServers = () => {
    queryClient.refetchQueries({ queryKey: ['servers'] })
  }

  return {
    // Data
    servers: servers ?? [],
    selectedServer: selectedServer ?? null,

    // Loading/Error
    isServersLoading,
    serversError,
    isSelectedServerLoading,
    selectedServerError,

    // Cache management utilities
    invalidateServers,
    invalidateServer,
    refetchServers,

    // Deprecated/Unavailable data (safe fallbacks)
    server: null,
    metricsHistory: [],
    isLoading: false,
  }
}
