import { useState } from "react"
import { useLiveQuery } from "@tanstack/react-db"
import { useCollectionsDB } from "@/providers/db-provider"
import type { Collection, ModItem, UpdatingMod, NewCollection } from "../types"

export function useCollections() {
  const collectionsCollection = useCollectionsDB()

  // Get collections from TanStack DB using live query (automatically reactive)
  const { data: collections = [] } = useLiveQuery(query =>
    query.from({ collections: collectionsCollection }),
  )

  // Local state for UI-specific concerns
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null)
  const [updatingMods, setUpdatingMods] = useState<UpdatingMod[]>([])

  // Derive selectedCollection from collections array to keep it in sync
  const selectedCollection = selectedCollectionId
    ? collections.find((c: Collection) => c.id === selectedCollectionId) || null
    : null

  // Helper functions for optimistic updates
  const findCollection = (id: number) =>
    collections.find((c: Collection) => c.id === id)

  // Direct collection mutations (no need for useMutation with TanStack DB)
  const createCollectionOptimistic = async (newCollection: NewCollection) => {
    const optimisticCollection: Collection = {
      id: Date.now(), // Temporary ID, will be replaced by server response
      name: newCollection.name,
      description: newCollection.description,
      mods: [],
      createdAt: new Date().toISOString().split("T")[0],
      isActive: false,
    }

    // Optimistic insert using TanStack DB
    await collectionsCollection.insert(optimisticCollection)
  }

  const updateCollectionOptimistic = async (
    id: number,
    updates: Partial<Collection>,
  ) => {
    const existingCollection = findCollection(id)
    if (!existingCollection) return

    // If setting active, make others inactive first
    if (updates.isActive) {
      const activeCollections = collections.filter(
        (c: Collection) => c.isActive && c.id !== id,
      )
      for (const collection of activeCollections) {
        await collectionsCollection.update(collection.id, draft => {
          draft.isActive = false
        })
      }
    }

    // Optimistic update using TanStack DB
    await collectionsCollection.update(id, draft => {
      Object.assign(draft, updates)
    })
  }

  const deleteCollectionOptimistic = async (id: number) => {
    // Optimistic delete using TanStack DB
    await collectionsCollection.delete(id)
  }

  const toggleModOptimistic = async (collectionId: number, modId: number) => {
    const collection = findCollection(collectionId)
    const mod = collection?.mods.find((m: ModItem) => m.id === modId)

    if (!collection || !mod) return

    const updatedMods = collection.mods.map((m: ModItem) =>
      m.id === modId ? { ...m, disabled: !m.disabled } : m,
    )

    await collectionsCollection.update(collectionId, draft => {
      draft.mods = updatedMods
    })
    // TanStack DB will handle the API call automatically via onUpdate
  }

  const removeModOptimistic = async (collectionId: number, modId: number) => {
    const collection = findCollection(collectionId)
    if (!collection) return

    const updatedMods = collection.mods.filter((m: ModItem) => m.id !== modId)

    await collectionsCollection.update(collectionId, draft => {
      draft.mods = updatedMods
    })
    // TanStack DB will handle the API call automatically via onUpdate
  }

  // Action functions
  const createCollection = async (
    newCollection: NewCollection,
  ): Promise<Collection | undefined> => {
    try {
      await createCollectionOptimistic(newCollection)
      // TanStack DB will handle the API call automatically via onInsert
      return collections.find((c: Collection) => c.name === newCollection.name)
    } catch (error) {
      console.error("Create collection failed:", error)
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
      console.error("Delete collection failed:", error)
    }
  }

  const toggleMod = async (collectionId: number, modId: number) => {
    try {
      await toggleModOptimistic(collectionId, modId)
      // TanStack DB will handle state updates automatically
    } catch (error) {
      console.error("Toggle mod failed:", error)
    }
  }

  const removeModFromCollection = async (collectionId: number, modId: number) => {
    try {
      await removeModOptimistic(collectionId, modId)
      // TanStack DB will handle state updates automatically
    } catch (error) {
      console.error("Remove mod failed:", error)
    }
  }

  const updateMod = async (mod: ModItem) => {
    // Add mod to updating list
    const updatingMod: UpdatingMod = {
      id: mod.id,
      name: mod.name,
      version: mod.version,
      progress: 0,
      status: "downloading",
    }

    setUpdatingMods(prev => [...prev, updatingMod])

    // Simulate update process (this would be replaced with real API calls)
    const updateSteps = [
      { status: "downloading" as const, duration: 2000, progress: 50 },
      { status: "installing" as const, duration: 1500, progress: 80 },
      { status: "verifying" as const, duration: 1000, progress: 95 },
      { status: "completed" as const, duration: 500, progress: 100 },
    ]

    for (const step of updateSteps) {
      await new Promise(resolve => setTimeout(resolve, step.duration))

      setUpdatingMods(prev =>
        prev.map(m =>
          m.id === mod.id ? { ...m, status: step.status, progress: step.progress } : m,
        ),
      )
    }

    // Invalidate collections to reflect the update
    // queryClient.invalidateQueries({ queryKey: ['collections'] }); // This line was removed as per the edit hint

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setUpdatingMods(prev => prev.filter(m => m.id !== mod.id))
    }, 3000)
  }

  const updateAllMods = async () => {
    if (!selectedCollection) return

    const modsWithUpdates = selectedCollection.mods.filter(mod => mod.hasUpdate)

    for (const mod of modsWithUpdates) {
      await updateMod(mod)
    }
  }

  const setActive = async (collectionId: number) => {
    try {
      await updateCollectionOptimistic(collectionId, { isActive: true })
      // TanStack DB will handle the API call automatically via onUpdate
    } catch (error) {
      console.error("Set active failed:", error)
    }
  }

  const updateCollectionName = async (collectionId: number, newName: string) => {
    const trimmedName = newName.trim()
    if (!trimmedName) return

    try {
      await updateCollectionOptimistic(collectionId, { name: trimmedName })
      // TanStack DB will handle the API call automatically via onUpdate
    } catch (error) {
      console.error("Update collection name failed:", error)
    }
  }

  const cancelUpdate = (modId: number) => {
    setUpdatingMods(prev => prev.filter(m => m.id !== modId))
  }

  const dismissUpdate = (modId: number) => {
    setUpdatingMods(prev => prev.filter(m => m.id !== modId))
  }

  return {
    collections,
    selectedCollection,
    updatingMods,
    setSelectedCollectionId,
    createCollection,
    deleteCollection,
    toggleMod,
    removeModFromCollection,
    updateMod,
    updateAllMods,
    setActive,
    updateCollectionName,
    cancelUpdate,
    dismissUpdate,
  }
}
