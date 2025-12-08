import type React from 'react'
import { IconCheck, IconAlertCircle, IconLoader2, IconCloudDownload } from '@tabler/icons-react'
import type { ModSubscription } from '@/types/mods'

export type ModStatusType =
  | 'up-to-date'
  | 'update-available'
  | 'updating'
  | 'not-downloaded'
  | 'downloading'
  | 'download-failed'

export interface ModStatusInfo {
  type: ModStatusType
  label: string
  icon: React.ComponentType<{ className?: string }>
  iconClassName: string
}

/**
 * Determines the mod status based on mod properties.
 * This is a pure function that can be easily unit tested.
 */
export function getModStatus(mod: ModSubscription): ModStatusInfo {
  // Installed locally: determine if update is actually available
  if (mod.localPath) {
    // Show loading spinner when update is in progress
    if (mod.status === 'update_requested') {
      return {
        type: 'updating',
        label: 'Updating…',
        icon: IconLoader2,
        iconClassName: 'h-3.5 w-3.5 text-muted-foreground animate-spin',
      }
    }

    const hasNewerSteamUpdate =
      !!mod.shouldUpdate &&
      !!mod.steamLastUpdated &&
      !!mod.lastUpdated &&
      new Date(mod.steamLastUpdated) > new Date(mod.lastUpdated)

    if (hasNewerSteamUpdate) {
      return {
        type: 'update-available',
        label: 'Update available',
        icon: IconAlertCircle,
        iconClassName: 'h-3.5 w-3.5 text-orange-600',
      }
    }

    return {
      type: 'up-to-date',
      label: 'Up to date',
      icon: IconCheck,
      iconClassName: 'h-3.5 w-3.5 text-green-600',
    }
  }

  // Not installed locally: show backend-driven transient states when present
  if (mod.status === 'install_requested') {
    return {
      type: 'downloading',
      label: 'Downloading…',
      icon: IconLoader2,
      iconClassName: 'h-3.5 w-3.5 text-muted-foreground animate-spin',
    }
  }

  if (mod.status === 'install_failed') {
    return {
      type: 'download-failed',
      label: 'Download failed',
      icon: IconAlertCircle,
      iconClassName: 'h-3.5 w-3.5 text-red-600',
    }
  }

  return {
    type: 'not-downloaded',
    label: 'Not downloaded',
    icon: IconCloudDownload,
    iconClassName: 'h-3.5 w-3.5 text-muted-foreground',
  }
}
