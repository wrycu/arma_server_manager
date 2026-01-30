import { api } from '@/services/api'
import type {
  ModHelperResponse,
  ModHelper,
  ModSubscriptionsResponse,
  ModSubscriptionResponse,
  AddModSubscriptionRequest,
  AddModSubscriptionResponse,
  ModSubscriptionDetailsResponse,
  UpdateModSubscriptionRequest,
  ModDownloadResponse,
  AsyncJobStatusResponse,
  AsyncJobSuccessResponse,
  SteamCollectionResponse,
} from '@/types/api'

// Mod API endpoints
export const modService = {
  // Get mod overview from Steam API
  getModHelper: async (modId: number): Promise<ModHelper> => {
    const response = await api.get<ModHelperResponse>(`/arma3/mod/helper/${modId}`)
    return response.data.results
  },

  // Get list of existing mod subscriptions
  getModSubscriptions: async (): Promise<ModSubscriptionResponse[]> => {
    const response = await api.get<ModSubscriptionsResponse>('/arma3/mod/subscriptions')
    return response.data.results
  },

  // Add mod subscription(s)
  addModSubscriptions: async (
    mods: Array<{ steam_id: number }>
  ): Promise<AddModSubscriptionResponse> => {
    const requestData: AddModSubscriptionRequest = { mods }
    const response = await api.post<AddModSubscriptionResponse>(
      '/arma3/mod/subscription',
      requestData
    )
    return response.data
  },

  // Get specific mod subscription details
  getModSubscriptionDetails: async (modId: number): Promise<ModSubscriptionResponse> => {
    const response = await api.get<ModSubscriptionDetailsResponse>(
      `/arma3/mod/subscription/${modId}`
    )
    return response.data.results
  },

  // Update mod subscription details
  updateModSubscription: async (
    modId: number,
    updateData: UpdateModSubscriptionRequest
  ): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>(
      `/arma3/mod/subscription/${modId}`,
      updateData
    )
    return response.data
  },

  // Remove mod subscription
  removeModSubscription: async (modId: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/arma3/mod/subscription/${modId}`)
    return response.data
  },

  // Get mod subscription image (returns binary data)
  // Images are cached by React Query with staleTime: Infinity
  // Browser also caches based on server's Cache-Control headers (set to 1 hour)
  getModSubscriptionImage: async (modId: number): Promise<Blob> => {
    const response = await api.get<Blob>(`/arma3/mod/subscription/${modId}/image`, {
      responseType: 'blob',
    })
    return response.data
  },

  // Trigger mod download (returns job ID)
  downloadMod: async (modId: number): Promise<ModDownloadResponse> => {
    const response = await api.post<ModDownloadResponse>(`/arma3/mod/${modId}/download`)
    return response.data
  },

  // Trigger mod deletion (returns job ID)
  deleteMod: async (modId: number): Promise<ModDownloadResponse> => {
    const response = await api.delete<ModDownloadResponse>(`/arma3/mod/${modId}/download`)
    return response.data
  },

  // Get async job status
  getAsyncJobStatus: async (
    jobId: string
  ): Promise<AsyncJobStatusResponse | AsyncJobSuccessResponse> => {
    const response = await api.get<AsyncJobStatusResponse | AsyncJobSuccessResponse>(
      `/arma3/async/${jobId}`
    )
    return response.data
  },

  // Get mods from Steam collection
  // Note: skipErrorToast is used because callers typically fall back to treating
  // the ID as a direct mod ID when this fails (e.g., 400 "Not a collection")
  getSteamCollectionMods: async (
    collectionId: number,
    excludeSubscribed = false
  ): Promise<number[]> => {
    const params = excludeSubscribed ? { exclude_subscribed: 'true' } : {}
    const response = await api.get<SteamCollectionResponse>(
      `/arma3/steam/collection/${collectionId}`,
      { params, skipErrorToast: true }
    )
    return response.data.results
  },
}
