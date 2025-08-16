import { api } from '@/services/api'
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
  AddModToCollectionResponse,
  RemoveModFromCollectionResponse,
} from '@/types/api'

// Collections API endpoints
export const collectionsService = {
  // Get all collections
  getCollections: async (): Promise<CollectionResponse[]> => {
    const response = await api.get<CollectionsListResponse>('/arma3/mod/collections')
    return response.data.results
  },

  // Get specific collection details
  getCollection: async (collectionId: number): Promise<CollectionResponse> => {
    const response = await api.get<CollectionDetailsResponse>(
      `/arma3/mod/collection/${collectionId}`
    )
    return response.data.results
  },

  // Create new collection
  createCollection: async (
    collectionData: CreateCollectionRequest
  ): Promise<CreateCollectionResponse> => {
    const response = await api.post<CreateCollectionResponse>(
      '/arma3/mod/collection',
      collectionData
    )
    return response.data
  },

  // Update collection
  updateCollection: async (
    collectionId: number,
    updateData: UpdateCollectionRequest
  ): Promise<UpdateCollectionResponse> => {
    const response = await api.patch<UpdateCollectionResponse>(
      `/arma3/mod/collection/${collectionId}`,
      updateData
    )
    return response.data
  },

  // Delete collection
  deleteCollection: async (collectionId: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/arma3/mod/collection/${collectionId}`)
    return response.data
  },

  // Add mods to collection
  addModsToCollection: async (
    collectionId: number,
    modData: AddModToCollectionRequest
  ): Promise<AddModToCollectionResponse> => {
    const response = await api.patch<AddModToCollectionResponse>(
      `/arma3/mod/collection/${collectionId}/mods`,
      modData
    )
    return response.data
  },

  // Remove mod from collection
  removeModFromCollection: async (
    collectionId: number,
    params: RemoveModFromCollectionRequest
  ): Promise<RemoveModFromCollectionResponse> => {
    const response = await api.delete<RemoveModFromCollectionResponse>(
      `/arma3/mod/collection/${collectionId}/mods`,
      { data: params }
    )
    return response.data
  },

  // // Toggle mod in collection
  // toggleModInCollection: async (
  //   collectionId: number,
  //   modId: number,
  //   disabled: boolean
  // ): Promise<ToggleModInCollectionResponse> => {
  //   const response = await api.patch<ToggleModInCollectionResponse>(
  //     `/collections/${collectionId}/mods/${modId}`,
  //     { disabled }
  //   )
  //   return response.data
  // },
}
