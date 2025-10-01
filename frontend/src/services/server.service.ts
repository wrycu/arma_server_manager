import { api } from '@/services/api'
import type { ServerConfig, CreateServerRequest, UpdateServerRequest } from '@/types/server'

// Server API endpoints
export const serverService = {
  // ----- New server config endpoints aligned to backend (/api/arma3) -----
  // List server configurations
  listServers: async (): Promise<ServerConfig[]> => {
    const response = await api.get<{ results: ServerConfig[]; message: string }>('/arma3/servers')
    return response.data.results
  },

  // Get a single server configuration
  getServer: async (id: number, includeSensitive: boolean = false): Promise<ServerConfig> => {
    const response = await api.get<{ results: ServerConfig; message: string }>(
      `/arma3/server/${id}`,
      {
        params: { include_sensitive: includeSensitive },
      }
    )
    return response.data.results
  },

  // Create a server configuration
  createServer: async (data: CreateServerRequest): Promise<{ message: string; result: number }> => {
    const response = await api.post<{ message: string; result: number }>('/arma3/server', data)
    return response.data
  },

  // Update a server configuration
  updateServer: async (id: number, data: UpdateServerRequest): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>(`/arma3/server/${id}`, data)
    return response.data
  },

  // Delete a server configuration
  deleteServer: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/arma3/server/${id}`)
    return response.data
  },

  // Activate a server configuration (set as active for start/stop operations)
  activateServer: async (id: number): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`/arma3/server/${id}/activate`)
    return response.data
  },

  // Update server collection ID
  updateServerCollectionId: async (
    id: number,
    collectionId: number | null
  ): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>(`/arma3/server/${id}`, {
      collection_id: collectionId,
    })
    return response.data
  },

  // Direct server action methods using backend endpoints
  startServer: async (): Promise<{ message: string; status: string }> => {
    const response = await api.post<{ message: string; status: string }>('/arma3/server/start')
    return response.data
  },

  stopServer: async (): Promise<{ message: string; status: string }> => {
    const response = await api.post<{ message: string; status: string }>('/arma3/server/stop')
    return response.data
  },

  // Perform server action using direct endpoints
  performServerAction: async (
    action: 'start' | 'stop' | 'restart',
    _collectionId?: number
  ): Promise<{ message: string; status?: string }> => {
    try {
      if (action === 'start') {
        return await serverService.startServer()
      } else if (action === 'stop') {
        return await serverService.stopServer()
      } else if (action === 'restart') {
        // For restart, we need to stop then start
        await serverService.stopServer()
        return await serverService.startServer()
      }
      throw new Error(`Unknown action: ${action}`)
    } catch (error) {
      throw new Error(`Failed to ${action} server: ${error}`)
    }
  },
}
