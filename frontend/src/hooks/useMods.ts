import { useCallback, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mods, pollAsyncJob } from '@/services'
import { handleApiError } from '@/lib/error-handler'
import { formatFileSize } from '@/lib/filesize'
import type { ModHelper, ModSubscriptionResponse } from '@/types/api'
import type { ModSubscription } from '@/types/mods'

// Transform API response to local mod types
const transformApiMods = (response: ModSubscriptionResponse[]): ModSubscription[] => {
  return response.map((mod) => ({
    id: mod.id,
    steamId: mod.steam_id,
    filename: mod.filename,
    name: mod.name || `Mod ${mod.steam_id}`,
    modType: (mod.mod_type as 'mod' | 'mission' | 'map') || null,
    localPath: mod.local_path,
    isServerMod: mod.server_mod,
    sizeBytes: mod.size_bytes,
    size: formatFileSize(mod.size_bytes),
    lastUpdated: mod.last_updated,
    steamLastUpdated: mod.steam_last_updated,
    shouldUpdate: mod.should_update,
    imageAvailable: mod.image_available || false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    status: (mod as any).status,
  }))
}

export function useMods() {
  const queryClient = useQueryClient()

  // Track which mod is currently being operated on
  const [downloadingModId, setDownloadingModId] = useState<number | null>(null)
  const [uninstallingModId, setUninstallingModId] = useState<number | null>(null)

  // Fetch mod subscriptions using React Query
  const {
    data: modSubscriptions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['mods'],
    queryFn: async () => {
      console.log('🔄 Fetching mod subscriptions from API...')
      return await mods.getModSubscriptions()
    },
    // Use select for transformation - preserves structural sharing
    select: transformApiMods,
  })

  // Helper functions
  const findModSubscription = (steamId: number) =>
    modSubscriptions.find((mod: ModSubscription) => mod.steamId === steamId)

  // Mutations
  const addModSubscriptionMutation = useMutation({
    mutationFn: async (steamId: number) => {
      await mods.addModSubscriptions([{ steam_id: steamId }])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mods'] })
    },
    onError: (error) => {
      handleApiError(error, 'Failed to add mod subscription')
    },
  })

  const removeModSubscriptionMutation = useMutation({
    mutationFn: async (modId: number) => {
      await mods.removeModSubscription(modId)
    },
    onSuccess: (_data, modId) => {
      // Invalidate mod list to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['mods'] })
      // Invalidate the image cache for this mod so if a new mod with the same ID
      // is added later, we don't show the wrong image
      queryClient.removeQueries({ queryKey: ['mod-image', modId] })
    },
    onError: (error) => {
      handleApiError(error, 'Failed to remove mod subscription')
    },
  })

  const updateModSubscriptionMutation = useMutation({
    mutationFn: async ({
      modId,
      updates,
    }: {
      modId: number
      updates: Partial<ModSubscription>
    }) => {
      await mods.updateModSubscription(modId, {
        name: updates.name,
        filename: updates.filename,
        mod_type: updates.modType || undefined,
        local_path: updates.localPath || undefined,
        server_mod: updates.isServerMod,
        should_update: updates.shouldUpdate,
      })
    },
    onSuccess: () => {
      // Invalidate both mods and collections to ensure all UI updates
      queryClient.invalidateQueries({ queryKey: ['mods'] })
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
    onError: (error) => {
      handleApiError(error, 'Failed to update mod subscription')
    },
  })

  const downloadModMutation = useMutation({
    mutationFn: async (modId: number) => {
      setDownloadingModId(modId)
      return mods.downloadMod(modId)
    },
    onSuccess: async (response) => {
      // Poll for completion silently
      await pollAsyncJob(
        response.status,
        undefined, // No status change callback
        (status) => {
          setDownloadingModId(null)
          const successStatuses = ['SUCCESS', 'SUCCEEDED']
          if (successStatuses.includes(status.status)) {
            console.log('✅ Download completed successfully, invalidating queries...')
            // Invalidate both mods and collections to ensure all UI updates
            queryClient.invalidateQueries({ queryKey: ['mods'] })
            queryClient.invalidateQueries({ queryKey: ['collections'] })
            console.log('✅ Queries invalidated - should trigger refetch')
          } else {
            // Show error with actual backend message
            handleApiError(new Error(status.message), `Download failed: ${status.message}`)
          }
        }
      )
    },
    onError: (error) => {
      setDownloadingModId(null)
      handleApiError(error, 'Download failed')
    },
  })

  const uninstallModMutation = useMutation({
    mutationFn: async (modId: number) => {
      setUninstallingModId(modId)
      return mods.deleteMod(modId)
    },
    onSuccess: async (response) => {
      // Poll for completion silently
      await pollAsyncJob(
        response.status,
        undefined, // No status change callback
        (status) => {
          setUninstallingModId(null)
          const successStatuses = ['SUCCESS', 'SUCCEEDED']
          if (successStatuses.includes(status.status)) {
            // Invalidate both mods and collections to ensure all UI updates
            queryClient.invalidateQueries({ queryKey: ['mods'] })
            queryClient.invalidateQueries({ queryKey: ['collections'] })
          } else {
            // Show error with actual backend message
            handleApiError(new Error(status.message), `Uninstall failed: ${status.message}`)
          }
        }
      )
    },
    onError: (error) => {
      setUninstallingModId(null)
      handleApiError(error, 'Uninstall failed')
    },
  })

  // Action functions
  const addModSubscription = async (steamId: number): Promise<void> => {
    try {
      await addModSubscriptionMutation.mutateAsync(steamId)
    } catch (error) {
      console.error('Add mod subscription failed:', error)
    }
  }

  const removeModSubscription = async (steamId: number): Promise<void> => {
    const mod = findModSubscription(steamId)
    if (!mod) return

    try {
      await removeModSubscriptionMutation.mutateAsync(mod.id)
    } catch (error) {
      console.error('Remove mod subscription failed:', error)
    }
  }

  const updateModSubscription = async (
    steamId: number,
    updates: Partial<ModSubscription>
  ): Promise<void> => {
    const mod = findModSubscription(steamId)
    if (!mod) return

    try {
      await updateModSubscriptionMutation.mutateAsync({ modId: mod.id, updates })
    } catch (error) {
      console.error('Update mod subscription failed:', error)
    }
  }

  const downloadMod = async (steamId: number): Promise<void> => {
    const mod = findModSubscription(steamId)
    if (!mod) return

    try {
      await downloadModMutation.mutateAsync(mod.id)
    } catch (error) {
      console.error('Download mod failed:', error)
    }
  }

  const uninstallMod = async (steamId: number): Promise<void> => {
    const mod = findModSubscription(steamId)
    if (!mod) return

    try {
      await uninstallModMutation.mutateAsync(mod.id)
    } catch (error) {
      console.error('Uninstall mod failed:', error)
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
    isLoading,
    error,

    // Loading states (using mutation states)
    isAdding: addModSubscriptionMutation.isPending,
    isRemoving: removeModSubscriptionMutation.isPending,
    isUpdating: updateModSubscriptionMutation.isPending,
    downloadingModId,
    uninstallingModId,

    // Actions
    addModSubscription,
    removeModSubscription,
    updateModSubscription,
    downloadMod,
    uninstallMod,
    getModHelper,

    // Helper functions
    findModSubscription,
  }
}
