import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collections as collectionsService } from '@/services'
import { handleApiError } from '@/lib/error-handler'
import { formatFileSize } from '@/lib/filesize'
import type { Collection, NewCollection } from '@/types/collections'
import type { CollectionResponse } from '@/types/api'

// Transform API response to local types
const transformApiCollections = (collections: CollectionResponse[]): Collection[] => {
  return collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    description: collection.description || '',
    mods: collection.mods
      .filter((entry) => entry.mod)
      .map((entry) => ({
        id: entry.mod!.id,
        steamId: entry.mod!.steam_id,
        filename: entry.mod!.filename,
        name: entry.mod!.name || `Mod ${entry.mod!.steam_id}`,
        modType: (entry.mod!.mod_type as 'mod' | 'mission' | 'map') || null,
        localPath: entry.mod!.local_path,
        isServerMod: entry.mod!.server_mod,
        sizeBytes: entry.mod!.size_bytes,
        size: formatFileSize(entry.mod!.size_bytes),
        lastUpdated: entry.mod!.last_updated,
        steamLastUpdated: entry.mod!.steam_last_updated,
        shouldUpdate: entry.mod!.should_update,
        imageAvailable: entry.mod!.image_available || false,
      })),
    createdAt: collection.created_at,
    isActive: false, // TODO: Add isActive support when API provides it
  }))
}

export function useCollections() {
  const queryClient = useQueryClient()

  // Fetch collections using React Query
  const {
    data: collections = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      console.log('🔄 Fetching collections from API...')
      const apiCollections = await collectionsService.getCollections()
      return transformApiCollections(apiCollections)
    },
  })

  // Helper functions
  const findCollection = (id: number) => collections.find((c: Collection) => c.id === id)

  // Mutations
  const createCollectionMutation = useMutation({
    mutationFn: async (newCollection: NewCollection) => {
      const response = await collectionsService.createCollection({
        name: newCollection.name,
        description: newCollection.description,
      })
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
    onError: (error) => {
      handleApiError(error, 'Failed to create collection')
    },
  })

  const updateCollectionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Collection> }) => {
      const response = await collectionsService.updateCollection(id, {
        name: updates.name,
        description: updates.description,
      })
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
    onError: (error) => {
      handleApiError(error, 'Failed to update collection')
    },
  })

  const deleteCollectionMutation = useMutation({
    mutationFn: async (id: number) => {
      await collectionsService.deleteCollection(id)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
    onError: (error) => {
      handleApiError(error, 'Failed to delete collection')
    },
  })

  const addModsToCollectionMutation = useMutation({
    mutationFn: async ({ collectionId, modIds }: { collectionId: number; modIds: number[] }) => {
      await collectionsService.addModsToCollection(collectionId, { mods: modIds })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
    onError: (error) => {
      handleApiError(error, 'Failed to add mods to collection')
    },
  })

  const removeModFromCollectionMutation = useMutation({
    mutationFn: async ({ collectionId, modId }: { collectionId: number; modId: number }) => {
      await collectionsService.removeModFromCollection(collectionId, modId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
    onError: (error) => {
      handleApiError(error, 'Failed to remove mod from collection')
    },
  })

  const reorderModInCollectionMutation = useMutation({
    mutationFn: async ({
      collectionId,
      modId,
      newLoadOrder,
    }: {
      collectionId: number
      modId: number
      newLoadOrder: number
    }) => {
      await collectionsService.reorderModInCollection(collectionId, modId, newLoadOrder)
    },
    onError: (error) => {
      handleApiError(error, 'Failed to reorder mod in collection')
      // Only refetch on error to get correct server state
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
  })

  // Action functions
  const createCollection = async (
    newCollection: NewCollection
  ): Promise<Collection | undefined> => {
    try {
      await createCollectionMutation.mutateAsync(newCollection)
      return collections.find((c: Collection) => c.name === newCollection.name)
    } catch (error) {
      console.error('Create collection failed:', error)
      return undefined
    }
  }

  const deleteCollection = async (id: number) => {
    try {
      await deleteCollectionMutation.mutateAsync(id)
    } catch (error) {
      console.error('Delete collection failed:', error)
    }
  }

  // TODO: Implement when API supports it
  const toggleMod = async (_collectionId: number, _modId: number) => {
    console.warn('Mod disabling is temporarily disabled until API supports it')
    // No-op for now
  }

  const removeModFromCollection = async (collectionId: number, modId: number) => {
    try {
      await removeModFromCollectionMutation.mutateAsync({
        collectionId,
        modId,
      })
    } catch (error) {
      console.error('Remove mod failed:', error)
    }
  }

  const addModsToCollection = async (collectionId: number, modIds: number[]) => {
    try {
      await addModsToCollectionMutation.mutateAsync({ collectionId, modIds })
    } catch (error) {
      console.error('Add mods to collection failed:', error)
    }
  }

  const setActive = async (collectionId: number) => {
    try {
      // For now, this is just a local state update since API doesn't support it yet
      // When API supports it, we'll make an API call here
      console.log(`Setting collection ${collectionId} as active`)
    } catch (error) {
      console.error('Set active failed:', error)
    }
  }

  const updateCollectionName = async (collectionId: number, newName: string) => {
    const trimmedName = newName.trim()
    if (!trimmedName) return

    const existingCollection = findCollection(collectionId)
    if (!existingCollection) return

    try {
      await updateCollectionMutation.mutateAsync({
        id: collectionId,
        updates: { name: trimmedName },
      })
    } catch (error) {
      console.error('Update collection name failed:', error)
    }
  }

  const reorderModInCollection = async (
    collectionId: number,
    modId: number,
    newLoadOrder: number
  ) => {
    try {
      await reorderModInCollectionMutation.mutateAsync({
        collectionId,
        modId,
        newLoadOrder,
      })
    } catch (error) {
      console.error('Reorder mod failed:', error)
      throw error
    }
  }

  return {
    collections,
    isLoading,
    error,
    createCollection,
    deleteCollection,
    toggleMod,
    removeModFromCollection,
    addModsToCollection,
    setActive,
    updateCollectionName,
    reorderModInCollection,
  }
}
