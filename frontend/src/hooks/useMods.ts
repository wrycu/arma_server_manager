import { useState, useCallback } from 'react'
import { useLiveQuery } from '@tanstack/react-db'
import { useModsDB } from '@/providers/db-provider'
import { mods } from '@/services'
import type {
  ModSubscription,
  ModHelper,
  ModDownloadResponse,
  AsyncJobStatusResponse,
  AsyncJobSuccessResponse,
} from '@/types/api'
import type { UpdatingMod } from '../../../types/mods.ts'

export function useMods() {
  const modsCollection = useModsDB()

  // Get mod subscriptions from TanStack DB using live query (automatically reactive)
  const { data: modSubscriptions = [] } = useLiveQuery((query) =>
    query.from({ mods: modsCollection })
  )

  // Local state for UI-specific concerns
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [updatingMods, setUpdatingMods] = useState<UpdatingMod[]>([])

  // Helper functions for optimistic updates
  const findModSubscription = (steamId: number) =>
    modSubscriptions.find((mod: ModSubscription) => mod.steam_id === steamId)

  // Direct mod mutations (no need for useMutation with TanStack DB)
  const addModSubscriptionOptimistic = async (steamId: number, name?: string) => {
    const optimisticMod: ModSubscription = {
      steam_id: steamId,
      name: name || `Mod ${steamId}`,
      status: 'pending',
      last_updated: new Date().toISOString(),
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
        last_updated: new Date().toISOString(),
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

  // Download/update mod functionality
  const downloadMod = async (steamId: number): Promise<void> => {
    const mod = findModSubscription(steamId)
    if (!mod) return

    // Add mod to updating list
    const updatingMod: UpdatingMod = {
      id: steamId,
      name: mod.name || `Mod ${steamId}`,
      progress: 0,
      status: 'downloading',
    }

    setUpdatingMods((prev) => [...prev, updatingMod])

    try {
      // Start download job
      const downloadResponse: ModDownloadResponse = await mods.downloadMod(steamId)
      const jobId = downloadResponse.status

      // Poll job status
      await pollJobStatus(jobId, steamId)
    } catch (error) {
      console.error('Download mod failed:', error)
      setUpdatingMods((prev) =>
        prev.map((m) => (m.id === steamId ? { ...m, status: 'error', error: String(error) } : m))
      )
    }
  }

  const deleteMod = async (steamId: number): Promise<void> => {
    const mod = findModSubscription(steamId)
    if (!mod) return

    try {
      const deleteResponse: ModDownloadResponse = await mods.deleteMod(steamId)
      const jobId = deleteResponse.status

      // Poll job status
      await pollJobStatus(jobId, steamId)
    } catch (error) {
      console.error('Delete mod failed:', error)
    }
  }

  const pollJobStatus = async (jobId: string, modId: number): Promise<void> => {
    const pollInterval = 1000 // 1 second
    const maxPolls = 300 // 5 minutes timeout
    let pollCount = 0

    const poll = async (): Promise<void> => {
      if (pollCount >= maxPolls) {
        setUpdatingMods((prev) =>
          prev.map((m) => (m.id === modId ? { ...m, status: 'error', error: 'Timeout' } : m))
        )
        return
      }

      try {
        const jobStatus: AsyncJobStatusResponse | AsyncJobSuccessResponse =
          await mods.getAsyncJobStatus(jobId)

        if (jobStatus.status === 'completed') {
          setUpdatingMods((prev) =>
            prev.map((m) => (m.id === modId ? { ...m, status: 'completed', progress: 100 } : m))
          )

          // Auto-dismiss after 3 seconds
          setTimeout(() => {
            setUpdatingMods((prev) => prev.filter((m) => m.id !== modId))
          }, 3000)

          return
        }

        if (jobStatus.status === 'failed' || jobStatus.status === 'error') {
          setUpdatingMods((prev) =>
            prev.map((m) =>
              m.id === modId ? { ...m, status: 'error', error: String(jobStatus.message) } : m
            )
          )
          return
        }

        // Update progress if still in progress
        const progress = Math.min(pollCount * 2, 95) // Simulate progress
        setUpdatingMods((prev) =>
          prev.map((m) => (m.id === modId ? { ...m, progress, status: 'downloading' } : m))
        )

        pollCount++
        setTimeout(poll, pollInterval)
      } catch (error) {
        setUpdatingMods((prev) =>
          prev.map((m) => (m.id === modId ? { ...m, status: 'error', error: String(error) } : m))
        )
      }
    }

    await poll()
  }

  const cancelUpdate = (modId: number) => {
    setUpdatingMods((prev) => prev.filter((m) => m.id !== modId))
  }

  const dismissUpdate = (modId: number) => {
    setUpdatingMods((prev) => prev.filter((m) => m.id !== modId))
  }

  return {
    // Data
    modSubscriptions,
    updatingMods,

    // Loading states
    isLoading,

    // Actions
    addModSubscription,
    removeModSubscription,
    updateModSubscription,
    downloadMod,
    deleteMod,
    getModHelper,
    cancelUpdate,
    dismissUpdate,

    // Helper functions
    findModSubscription,
  }
}
