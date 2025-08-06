import { api } from '../api'
import type {
  ServerStatusResponse,
  ServerMetricsResponse,
  ServerActionRequest,
  ServerConfigResponse,
  UpdateServerConfigRequest,
} from '@/types/api'

// Server API endpoints
export const serverService = {
  // Get server status
  getServerStatus: async (): Promise<ServerStatusResponse> => {
    const response = await api.get<ServerStatusResponse>('/server/status')
    return response.data
  },

  // Get server metrics
  getServerMetrics: async (): Promise<ServerMetricsResponse[]> => {
    const response = await api.get<ServerMetricsResponse[]>('/server/metrics')
    return response.data
  },

  // Perform server action (start/stop/restart)
  performServerAction: async (
    actionData: ServerActionRequest
  ): Promise<{ message: string; status: string }> => {
    const response = await api.post<{ message: string; status: string }>(
      '/server/action',
      actionData
    )
    return response.data
  },

  // Get server configuration
  getServerConfig: async (): Promise<ServerConfigResponse> => {
    const response = await api.get<ServerConfigResponse>('/server/config')
    return response.data
  },

  // Update server configuration
  updateServerConfig: async (
    configData: UpdateServerConfigRequest
  ): Promise<ServerConfigResponse> => {
    const response = await api.patch<ServerConfigResponse>('/server/config', configData)
    return response.data
  },
}
