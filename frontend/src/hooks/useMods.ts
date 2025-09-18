import { useState, useCallback } from 'react'
import { useLiveQuery } from '@tanstack/react-db'
import { useModsDB } from '@/providers/db-provider'
import { mods } from '@/services'
import type { ModHelper } from '@/types/api'
import type { ModSubscription } from '@/types/mods'

export function useMods() {
  const modsCollection = useModsDB()

  // Get mod subscriptions from TanStack DB using live query (automatically reactive)
  const { data: modSubscriptions = [] } = useLiveQuery((query) =>
    query.from({ mods: modsCollection })
  )

  // Local state for UI-specific concerns
  const [isLoading, setIsLoading] = useState<string | null>(null)

  // Helper functions for optimistic updates
  const findModSubscription = (steamId: number) =>
    modSubscriptions.find((mod: ModSubscription) => mod.steamId === steamId)

  // Direct mod mutations (no need for useMutation with TanStack DB)
  const addModSubscriptionOptimistic = async (steamId: number, name?: string) => {
    const optimisticMod: ModSubscription = {
      id: steamId,
      steamId: steamId,
      filename: `mod_${steamId}`,
      name: name || `Mod ${steamId}`,
      modType: null,
      localPath: null,
      arguments: null,
      isServerMod: false,
      sizeBytes: null,
      size: 'Unknown',
      lastUpdated: new Date().toISOString(),
      steamLastUpdated: null,
      shouldUpdate: false,
      imageAvailable: false,
    }

    // Optimistic insert using TanStack DB
    await modsCollection.insert(optimisticMod)
  }

  const updateModSubscriptionOptimistic = async (
    steamId: number,
    updates: Partial<ModSubscription>
  ) => {
    const existingMod = findModSubscription(steamId)
    if (!existingMod) return

    // Optimistic update using TanStack DB
    await modsCollection.update(steamId, (draft) => {
      Object.assign(draft, updates, {
        lastUpdated: new Date().toISOString(),
      })
    })
  }

  const deleteModSubscriptionOptimistic = async (steamId: number) => {
    // Optimistic delete using TanStack DB
    await modsCollection.delete(steamId)
  }

  // Action functions
  const addModSubscription = async (steamId: number): Promise<void> => {
    setIsLoading('adding')
    try {
      // Get mod info first
      const modHelper = await getModHelper(steamId)
      await addModSubscriptionOptimistic(steamId, modHelper.title)
      // TanStack DB will handle the API call automatically via onInsert
    } catch (error) {
      console.error('Add mod subscription failed:', error)
    } finally {
      setIsLoading(null)
    }
  }

  const removeModSubscription = async (steamId: number): Promise<void> => {
    setIsLoading('removing')
    try {
      await deleteModSubscriptionOptimistic(steamId)
      // TanStack DB will handle the API call automatically via onDelete
    } catch (error) {
      console.error('Remove mod subscription failed:', error)
    } finally {
      setIsLoading(null)
    }
  }

  const updateModSubscription = async (
    steamId: number,
    updates: Partial<ModSubscription>
  ): Promise<void> => {
    setIsLoading('updating')
    try {
      await updateModSubscriptionOptimistic(steamId, updates)
      // TanStack DB will handle the API call automatically via onUpdate
    } catch (error) {
      console.error('Update mod subscription failed:', error)
    } finally {
      setIsLoading(null)
    }
  }

  // Get mod helper information from Steam API
  const getModHelper = useCallback(async (modId: number): Promise<ModHelper> => {
    try {
      return await mods.getModHelper(modId)
    } catch (error) {
      console.error('Get mod helper failed:', error)
      throw error
    }
  }, [])

  return {
    // Data
    modSubscriptions,

    // Loading states
    isLoading,

    // Actions
    addModSubscription,
    removeModSubscription,
    updateModSubscription,
    getModHelper,

    // Helper functions
    findModSubscription,
  }
}
