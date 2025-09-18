import { useState } from 'react'
import { useLiveQuery } from '@tanstack/react-db'
import { useCollectionsDB } from '@/providers/db-provider'
import type { Collection, NewCollection } from '@/types/collections'
import type { ModSubscription } from '@/types/mods'

export function useCollections() {
  const collectionsCollection = useCollectionsDB()

  // Get collections from TanStack DB using live query (automatically reactive)
  const { data: collections = [] } = useLiveQuery((query) =>
    query.from({ collections: collectionsCollection })
  )

  // Local state for UI-specific concerns
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null)

  // Derive selectedCollection from collections array to keep it in sync
  const selectedCollection = selectedCollectionId
    ? collections.find((c: Collection) => c.id === selectedCollectionId) || null
    : null

  // Helper functions for optimistic updates
  const findCollection = (id: number) => collections.find((c: Collection) => c.id === id)

  // Direct collection mutations (no need for useMutation with TanStack DB)
  const createCollectionOptimistic = async (newCollection: NewCollection) => {
    const optimisticCollection: Collection = {
      id: Date.now(), // Temporary ID, will be replaced by server response
      name: newCollection.name,
      description: newCollection.description,
      mods: [],
      createdAt: new Date().toISOString().split('T')[0],
      isActive: false,
    }

    // Optimistic insert using TanStack DB
    await collectionsCollection.insert(optimisticCollection)
  }

  const updateCollectionOptimistic = async (id: number, updates: Partial<Collection>) => {
    const existingCollection = findCollection(id)
    if (!existingCollection) return

    // If setting active, make others inactive first
    if (updates.isActive) {
      const activeCollections = collections.filter((c: Collection) => c.isActive && c.id !== id)
      for (const collection of activeCollections) {
        await collectionsCollection.update(collection.id, (draft) => {
          draft.isActive = false
        })
      }
    }

    // Optimistic update using TanStack DB
    await collectionsCollection.update(id, (draft) => {
      Object.assign(draft, updates)
    })
  }

  const deleteCollectionOptimistic = async (id: number) => {
    // Optimistic delete using TanStack DB
    await collectionsCollection.delete(id)
  }

  // TODO: Remove when API supports mod disabling
  // const toggleModOptimistic = async (collectionId: number, modId: number) => {
  //   const collection = findCollection(collectionId)
  //   const mod = collection?.mods.find((m: ModSubscription) => m.id === modId)

  //   if (!collection || !mod) return

  //   const updatedMods = collection.mods.map((m: ModSubscription) =>
  //     m.id === modId ? { ...m, disabled: !m.disabled } : m
  //   )

  //   await collectionsCollection.update(collectionId, (draft) => {
  //     draft.mods = updatedMods
  //   })
  //   // TanStack DB will handle the API call automatically via onUpdate
  // }

  // Temporarily disabled mod toggling until API supports it
  const toggleModOptimistic = async (_collectionId: number, _modId: number) => {
    console.warn('Mod disabling is temporarily disabled until API supports it')
    // No-op for now
  }

  const removeModOptimistic = async (collectionId: number, modId: number) => {
    const collection = findCollection(collectionId)
    if (!collection) return

    const updatedMods = collection.mods.filter((m: ModSubscription) => m.id !== modId)

    await collectionsCollection.update(collectionId, (draft) => {
      draft.mods = updatedMods
    })
    // TanStack DB will handle the API call automatically via onUpdate
  }

  const addModsToCollectionOptimistic = async (collectionId: number, modIds: number[]) => {
    const collection = findCollection(collectionId)
    if (!collection) return

    // For now, create placeholder ModSubscriptions since we need actual mod data from the backend
    // The actual implementation will be handled by TanStack DB's onUpdate callback
    // which will call the real API and update with proper mod data
    const placeholderMods: ModSubscription[] = modIds.map((id) => ({
      id,
      steamId: id,
      filename: `mod_${id}`,
      name: `Mod ${id}`, // Placeholder name
      modType: 'mod' as const,
      localPath: null,
      arguments: null,
      isServerMod: false,
      sizeBytes: null,
      size: 'Unknown',
      lastUpdated: null,
      steamLastUpdated: null,
      shouldUpdate: false,
      imageAvailable: false,
    }))

    const updatedMods = [...collection.mods, ...placeholderMods]

    await collectionsCollection.update(collectionId, (draft) => {
      draft.mods = updatedMods
    })
    // TanStack DB will handle the API call automatically via onUpdate
  }

  // Action functions
  const createCollection = async (
    newCollection: NewCollection
  ): Promise<Collection | undefined> => {
    try {
      await createCollectionOptimistic(newCollection)
      // TanStack DB will handle the API call automatically via onInsert
      return collections.find((c: Collection) => c.name === newCollection.name)
    } catch (error) {
      console.error('Create collection failed:', error)
      return undefined
    }
  }

  const deleteCollection = async (id: number) => {
    try {
      await deleteCollectionOptimistic(id)
      // Reset selected collection if it was deleted
      if (selectedCollection?.id === id) {
        setSelectedCollectionId(null)
      }
      // TanStack DB will handle the API call automatically via onDelete
    } catch (error) {
      console.error('Delete collection failed:', error)
    }
  }

  const toggleMod = async (collectionId: number, modId: number) => {
    try {
      await toggleModOptimistic(collectionId, modId)
      // TanStack DB will handle state updates automatically
    } catch (error) {
      console.error('Toggle mod failed:', error)
    }
  }

  const removeModFromCollection = async (collectionId: number, modId: number) => {
    try {
      await removeModOptimistic(collectionId, modId)
      // TanStack DB will handle state updates automatically
    } catch (error) {
      console.error('Remove mod failed:', error)
    }
  }

  const addModsToCollection = async (collectionId: number, modIds: number[]) => {
    try {
      await addModsToCollectionOptimistic(collectionId, modIds)
      // TanStack DB will handle state updates automatically
    } catch (error) {
      console.error('Add mods to collection failed:', error)
    }
  }

  const setActive = async (collectionId: number) => {
    try {
      await updateCollectionOptimistic(collectionId, { isActive: true })
      // TanStack DB will handle the API call automatically via onUpdate
    } catch (error) {
      console.error('Set active failed:', error)
    }
  }

  const updateCollectionName = async (collectionId: number, newName: string) => {
    const trimmedName = newName.trim()
    if (!trimmedName) return

    try {
      await updateCollectionOptimistic(collectionId, { name: trimmedName })
      // TanStack DB will handle the API call automatically via onUpdate
    } catch (error) {
      console.error('Update collection name failed:', error)
    }
  }

  return {
    collections,
    selectedCollection,
    setSelectedCollectionId,
    createCollection,
    deleteCollection,
    toggleMod,
    removeModFromCollection,
    addModsToCollection,
    setActive,
    updateCollectionName,
  }
}
