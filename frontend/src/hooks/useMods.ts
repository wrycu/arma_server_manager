import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mods } from '@/services'
import { handleApiError, showInfoToast } from '@/lib/error-handler'
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
    arguments: mod.arguments,
    isServerMod: mod.server_mod,
    sizeBytes: mod.size_bytes,
    size: formatFileSize(mod.size_bytes),
    lastUpdated: mod.last_updated,
    steamLastUpdated: mod.steam_last_updated,
    shouldUpdate: mod.should_update,
    imageAvailable: mod.image_available || false,
  }))
}

export function useMods() {
  const queryClient = useQueryClient()

  // Fetch mod subscriptions using React Query
  const {
    data: modSubscriptions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['mods'],
    queryFn: async () => {
      console.log('🔄 Fetching mod subscriptions from API...')
      const apiModSubscriptions = await mods.getModSubscriptions()
      return transformApiMods(apiModSubscriptions)
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mods'] })
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
        arguments: updates.arguments || undefined,
        server_mod: updates.isServerMod,
        should_update: updates.shouldUpdate,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mods'] })
    },
    onError: (error) => {
      handleApiError(error, 'Failed to update mod subscription')
    },
  })

  const downloadModMutation = useMutation({
    mutationFn: async (modId: number) => {
      await mods.downloadMod(modId)
    },
    onSuccess: () => {
      // Download is asynchronous, so we don't show completion toast here
      // The user will be notified via the "Download Requested" toast in downloadMod()
      queryClient.invalidateQueries({ queryKey: ['mods'] })
    },
    onError: (error) => {
      handleApiError(error, 'Failed to download mod')
    },
  })

  const uninstallModMutation = useMutation({
    mutationFn: async (modId: number) => {
      await mods.deleteMod(modId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mods'] })
    },
    onError: (error) => {
      handleApiError(error, 'Failed to uninstall mod')
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

    // Show toast notification that download has been requested
    showInfoToast('Download Requested')

    try {
      await downloadModMutation.mutateAsync(mod.id)
    } catch (error) {
      console.error('Download mod failed:', error)
    }
  }

  const uninstallMod = async (steamId: number): Promise<void> => {
    const mod = findModSubscription(steamId)
    if (!mod) return

    // Show toast notification that uninstall has been requested
    showInfoToast('Uninstall Requested')

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
    isDownloading: downloadModMutation.isPending,
    isUninstalling: uninstallModMutation.isPending,

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
