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

  // Server action methods using schedule system
  // Create a temporary schedule for immediate server action
  createServerActionSchedule: async (
    action: 'server_start' | 'server_stop' | 'server_restart'
  ): Promise<{ result: number; message: string }> => {
    const scheduleData = {
      name: `Immediate ${action.replace('server_', '')}`,
      action: action,
      celery_name: 'immediate', // Special celery name for immediate execution
      enabled: true,
    }
    const response = await api.post<{ result: number; message: string }>(
      '/arma3/schedule',
      scheduleData
    )
    return response.data
  },

  // Trigger a schedule (for immediate server actions)
  triggerSchedule: async (scheduleId: number): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`/arma3/schedule/${scheduleId}/trigger`)
    return response.data
  },

  // Perform server action by creating and triggering a schedule
  performServerAction: async (
    action: 'start' | 'stop' | 'restart',
    _collectionId?: number
  ): Promise<{ message: string }> => {
    try {
      // Create temporary schedule for the action
      const scheduleAction = `server_${action}` as 'server_start' | 'server_stop' | 'server_restart'
      const createResponse = await serverService.createServerActionSchedule(scheduleAction)

      // Trigger the schedule immediately
      await serverService.triggerSchedule(createResponse.result)

      return {
        message: `Server ${action} initiated successfully`,
      }
    } catch (error) {
      throw new Error(`Failed to ${action} server: ${error}`)
    }
  },
}
