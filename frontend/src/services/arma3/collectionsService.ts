import { api } from '../api'
import type {
  CollectionResponse,
  CollectionsListResponse,
  CollectionDetailsResponse,
  CreateCollectionRequest,
  CreateCollectionResponse,
  UpdateCollectionRequest,
  UpdateCollectionResponse,
  AddModToCollectionRequest,
  RemoveModFromCollectionRequest,
} from '@/types/api'

// Collections API endpoints
export const collectionsService = {
  // Get all collections
  getCollections: async (): Promise<CollectionResponse[]> => {
    const response = await api.get<CollectionsListResponse>('/collections')
    return response.data.results
  },

  // Get specific collection details
  getCollection: async (collectionId: number): Promise<CollectionResponse> => {
    const response = await api.get<CollectionDetailsResponse>(`/collections/${collectionId}`)
    return response.data.results
  },

  // Create new collection
  createCollection: async (
    collectionData: CreateCollectionRequest
  ): Promise<CollectionResponse> => {
    const response = await api.post<CreateCollectionResponse>('/collections', collectionData)
    return response.data.results
  },

  // Update collection
  updateCollection: async (
    collectionId: number,
    updateData: UpdateCollectionRequest
  ): Promise<CollectionResponse> => {
    const response = await api.patch<UpdateCollectionResponse>(
      `/collections/${collectionId}`,
      updateData
    )
    return response.data.results
  },

  // Delete collection
  deleteCollection: async (collectionId: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/collections/${collectionId}`)
    return response.data
  },

  // Add mods to collection
  addModsToCollection: async (
    collectionId: number,
    modData: AddModToCollectionRequest
  ): Promise<CollectionResponse> => {
    const response = await api.post<UpdateCollectionResponse>(
      `/collections/${collectionId}/mods`,
      modData
    )
    return response.data.results
  },

  // Remove mod from collection
  removeModFromCollection: async (
    collectionId: number,
    modData: RemoveModFromCollectionRequest
  ): Promise<CollectionResponse> => {
    const response = await api.delete<UpdateCollectionResponse>(
      `/collections/${collectionId}/mods/${modData.modId}`
    )
    return response.data.results
  },

  // Toggle mod in collection
  toggleModInCollection: async (
    collectionId: number,
    modId: number,
    disabled: boolean
  ): Promise<CollectionResponse> => {
    const response = await api.patch<UpdateCollectionResponse>(
      `/collections/${collectionId}/mods/${modId}`,
      { disabled }
    )
    return response.data.results
  },
}
