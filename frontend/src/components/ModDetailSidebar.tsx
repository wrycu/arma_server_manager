import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  IconCheck,
  IconDownload,
  IconTrash,
  IconExternalLink,
  IconCloudDownload,
  IconAlertCircle,
  IconLoader2,
  IconCircleMinus,
} from '@tabler/icons-react'

import {
  RightSidebar,
  RightSidebarHeader,
  RightSidebarContent,
  RightSidebarFooter,
} from '@/components/ui/right-sidebar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import type { ModSubscription } from '@/types/mods'
import { mods } from '@/services'
import { formatDate } from '@/lib/date'
import { blobUrlCache } from '@/lib/helpers/blobUrlCache'

interface ModDetailSidebarProps {
  mod: ModSubscription | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRemove?: () => void
  onSave?: (steamId: number, updates: { isServerMod: boolean }) => Promise<void>
  onDownload?: (steamId: number) => void
  onDelete?: (steamId: number) => void
  onUninstall?: (steamId: number) => void
  isDownloading?: boolean
  isUninstalling?: boolean
}

export function ModDetailSidebar({
  mod,
  open,
  onOpenChange,
  onRemove,
  onSave,
  onDownload,
  onDelete,
  onUninstall,
  isDownloading = false,
  isUninstalling = false,
}: ModDetailSidebarProps) {
  // Form state
  const [editedIsServerMod, setEditedIsServerMod] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState(false)

  // Track if form has been modified
  const [isDirty, setIsDirty] = useState(false)

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Uninstall confirmation state
  const [showUninstallConfirm, setShowUninstallConfirm] = useState(false)

  // Image state
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const loadedModIdRef = useRef<number | null>(null)
  const cacheKey = mod ? `mod-${mod.id}` : null

  // Memoize queryFn to prevent new function reference on every render
  const imageQueryFn = useMemo(
    () => () => (mod ? mods.getModSubscriptionImage(mod.id) : Promise.reject()),
    [mod]
  )

  // Fetch mod image with caching
  const { data: imageBlob, isFetching: isImageFetching } = useQuery({
    queryKey: ['mod-image', mod?.id],
    queryFn: imageQueryFn,
    enabled: !!mod?.imageAvailable && open,
    staleTime: Infinity, // Images don't change frequently
    gcTime: 1000 * 60 * 30, // Cache for 30 minutes
  })

  // Create or retrieve cached object URL and preload the image
  useEffect(() => {
    if (imageBlob && mod && cacheKey) {
      // Get or create cached URL (increments ref count)
      const url = blobUrlCache.getOrCreate(cacheKey, imageBlob)

      // Preload the image
      const img = new Image()
      img.onload = () => {
        setImageUrl(url)
        setImageLoaded(true)
        loadedModIdRef.current = mod.id
      }
      img.onerror = () => {
        // Image failed to load - mark as loaded to hide skeleton and show nothing
        console.warn(`Failed to load image for mod ${mod.id}`)
        setImageLoaded(true)
        setImageUrl(null)
        loadedModIdRef.current = mod.id
      }
      img.src = url
      imgRef.current = img
    }
  }, [imageBlob, mod, cacheKey])

  // Reset loaded state only when mod id actually changes to a different value
  useEffect(() => {
    if (loadedModIdRef.current !== null && mod && loadedModIdRef.current !== mod.id) {
      setImageLoaded(false)
      setImageUrl(null)
    }
  }, [mod])

  // Release reference on unmount or when mod changes
  useEffect(() => {
    const currentCacheKey = cacheKey

    return () => {
      // Release the cache reference (only revokes when ref count reaches 0)
      if (currentCacheKey) {
        blobUrlCache.release(currentCacheKey)
      }

      if (imgRef.current) {
        imgRef.current.onload = null
        imgRef.current.onerror = null
        imgRef.current = null
      }
    }
  }, [cacheKey])

  // Reset form when mod changes
  useEffect(() => {
    if (mod) {
      setEditedIsServerMod(mod.isServerMod)
      setIsDirty(false)
      setShowDeleteConfirm(false)
      setShowUninstallConfirm(false)
    }
  }, [mod])

  // Reset confirmation states when sidebar closes
  useEffect(() => {
    if (!open) {
      setShowDeleteConfirm(false)
      setShowUninstallConfirm(false)
    }
  }, [open])

  // Check if form has been modified
  useEffect(() => {
    if (mod) {
      const serverModChanged = editedIsServerMod !== mod.isServerMod
      setIsDirty(serverModChanged)
    }
  }, [editedIsServerMod, mod])

  const handleSave = useCallback(async () => {
    if (!mod || !onSave || !isDirty) return

    setIsSaving(true)
    try {
      await onSave(mod.steamId, {
        isServerMod: editedIsServerMod,
      })
      // Form is no longer dirty after successful save
      setIsDirty(false)
    } catch (error) {
      console.error('Failed to save mod updates:', error)
    } finally {
      setIsSaving(false)
    }
  }, [mod, onSave, isDirty, editedIsServerMod])

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's' && isDirty && !isSaving) {
        e.preventDefault()
        handleSave()
      }
    }

    if (open) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, isDirty, isSaving, handleSave])

  const handleDelete = () => {
    if (onDelete && mod) {
      onDelete(mod.steamId)
      setShowDeleteConfirm(false)
    }
  }

  const handleRemove = () => {
    if (onRemove) {
      onRemove()
      setShowDeleteConfirm(false)
    }
  }

  const handleUninstall = () => {
    if (onUninstall && mod) {
      onUninstall(mod.steamId)
      setShowUninstallConfirm(false)
    }
  }

  if (!mod) return null

  return (
    <RightSidebar open={open} onOpenChange={onOpenChange}>
      <div className="flex flex-col h-full">
        {/* HEADER: Title and Close */}
        <RightSidebarHeader
          onClose={() => onOpenChange(false)}
          actions={
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                window.open(
                  `https://steamcommunity.com/sharedfiles/filedetails/?id=${mod.steamId}`,
                  '_blank'
                )
              }
              title="View on Steam Workshop"
            >
              <IconExternalLink className="h-4 w-4" />
            </Button>
          }
        >
          <div>
            <h2 className="text-base font-semibold truncate">{mod.name}</h2>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              {mod.isServerMod && <span>Server Mod</span>}
              {mod.isServerMod && mod.modType && <span>•</span>}
              {mod.modType && <span className="capitalize">{mod.modType}</span>}
            </div>
          </div>
        </RightSidebarHeader>

        {/* CONTENT: All information always visible */}
        <RightSidebarContent className="space-y-5">
          {/* Mod Image */}
          {mod.imageAvailable && (
            <div className="w-full aspect-video rounded-md overflow-hidden bg-muted -mt-1">
              {imageLoaded && imageUrl ? (
                <img src={imageUrl} alt={mod.name} className="w-full h-full object-contain" />
              ) : isImageFetching || !imageLoaded ? (
                <Skeleton className="w-full h-full" />
              ) : null}
            </div>
          )}

          {/* Metadata Grid - 2 columns for efficiency */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Workshop ID</p>
              <p className="font-medium text-sm">{mod.steamId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Download Status</p>
              <div className="flex items-center gap-1.5">
                {mod.localPath ? (
                  mod.shouldUpdate &&
                  mod.steamLastUpdated &&
                  mod.lastUpdated &&
                  new Date(mod.steamLastUpdated) > new Date(mod.lastUpdated) ? (
                    <>
                      <IconAlertCircle className="h-3.5 w-3.5 text-orange-600" />
                      <span className="font-medium text-sm text-orange-600">Update available</span>
                    </>
                  ) : (
                    <>
                      <IconCheck className="h-3.5 w-3.5 text-green-600" />
                      <span className="font-medium text-sm text-green-600">Up to date</span>
                    </>
                  )
                ) : mod.status === 'install_requested' ? (
                  <>
                    <IconLoader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
                    <span className="font-medium text-sm text-muted-foreground">Downloading…</span>
                  </>
                ) : mod.status === 'install_failed' ? (
                  <>
                    <IconAlertCircle className="h-3.5 w-3.5 text-red-600" />
                    <span className="font-medium text-sm text-red-600">Download failed</span>
                  </>
                ) : (
                  <>
                    <IconCloudDownload className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium text-sm text-muted-foreground">
                      Not downloaded
                    </span>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Size</p>
              <p className="font-medium text-sm">{mod.size}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Last Updated</p>
              <p className="font-medium text-sm">
                {mod.lastUpdated ? formatDate(mod.lastUpdated) : 'Never'}
              </p>
            </div>
            {mod.steamLastUpdated && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Steam Updated</p>
                <p className="font-medium text-sm">{formatDate(mod.steamLastUpdated)}</p>
              </div>
            )}
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground mb-0.5">Filename</p>
              <p className="font-medium text-sm break-all">{mod.filename}</p>
            </div>
            {mod.localPath && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-0.5">Local Path</p>
                <p className="font-mono text-xs break-all text-muted-foreground">{mod.localPath}</p>
              </div>
            )}
          </div>

          {/* Divider before editable section */}
          {onSave && <div className="border-t -mx-6" />}

          {/* Editable Configuration */}
          {onSave && (
            <div className="space-y-2.5">
              {/* Server Mod Checkbox */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Configuration</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="server-mod"
                    checked={editedIsServerMod}
                    onCheckedChange={(checked) => setEditedIsServerMod(checked as boolean)}
                  />
                  <Label htmlFor="server-mod" className="text-sm cursor-pointer">
                    Server only mod
                  </Label>
                </div>
              </div>

              {/* Save Button */}
              {isDirty && (
                <Button onClick={handleSave} disabled={isSaving} size="sm" className="w-full">
                  <IconCheck className="h-3.5 w-3.5 mr-1.5" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </div>
          )}
        </RightSidebarContent>

        {/* FOOTER: Primary Actions */}
        {(onDownload || onRemove || onDelete || onUninstall) && (
          <RightSidebarFooter>
            {/* Download action */}
            {onDownload && !mod.localPath && !showDeleteConfirm && !showUninstallConfirm && (
              <div className="flex justify-end mb-2">
                <Button
                  variant="default"
                  size="sm"
                  disabled={isDownloading}
                  onClick={() => onDownload(mod.steamId)}
                >
                  {isDownloading ? (
                    <IconLoader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                  ) : (
                    <IconDownload className="h-3.5 w-3.5 mr-2" />
                  )}
                  {isDownloading ? 'Downloading...' : 'Download Mod'}
                </Button>
              </div>
            )}

            {/* Uninstall confirmation (inline in footer) */}
            {onUninstall && mod.localPath && showUninstallConfirm && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground font-medium">Uninstall?</div>
                <div className="text-xs text-muted-foreground">
                  This will delete the local mod files but keep your subscription.
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUninstallConfirm(false)}
                    disabled={isUninstalling}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUninstall}
                    disabled={isUninstalling}
                  >
                    {isUninstalling ? (
                      <IconLoader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                    ) : (
                      <IconTrash className="h-3.5 w-3.5 mr-2" />
                    )}
                    {isUninstalling ? 'Uninstalling...' : 'Uninstall'}
                  </Button>
                </div>
              </div>
            )}

            {/* Remove/Unsubscribe confirmation (inline in footer) */}
            {(onRemove || onDelete) && showDeleteConfirm && (
              <div className="space-y-2">
                <div className="text-xs text-destructive font-medium">
                  {onRemove ? 'Remove from Collection?' : 'Unsubscribe?'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {onRemove
                    ? 'This will remove the mod from this collection. The mod files will remain.'
                    : 'This will permanently remove the mod subscription. This action cannot be undone.'}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={onRemove ? handleRemove : handleDelete}
                  >
                    <IconCircleMinus className="h-3.5 w-3.5 mr-2" />
                    {onRemove ? 'Remove' : 'Unsubscribe'}
                  </Button>
                </div>
              </div>
            )}

            {/* Action buttons - side by side, right aligned */}
            {!showUninstallConfirm &&
              !showDeleteConfirm &&
              ((onUninstall && mod.localPath) || onRemove || (onDelete && !onRemove)) && (
                <div className="flex justify-end gap-2">
                  {/* Uninstall local files (keeps subscription) */}
                  {onUninstall && mod.localPath && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isUninstalling}
                      onClick={() => setShowUninstallConfirm(true)}
                    >
                      {isUninstalling ? (
                        <IconLoader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                      ) : (
                        <IconTrash className="h-3.5 w-3.5 mr-2" />
                      )}
                      {isUninstalling ? 'Uninstalling...' : 'Uninstall'}
                    </Button>
                  )}

                  {/* Collection context: Remove from collection */}
                  {onRemove && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <IconCircleMinus className="h-3.5 w-3.5 mr-2" />
                      Remove
                    </Button>
                  )}

                  {/* Mod subscription context: Unsubscribe */}
                  {onDelete && !onRemove && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <IconCircleMinus className="h-3.5 w-3.5 mr-2" />
                      Unsubscribe
                    </Button>
                  )}
                </div>
              )}
          </RightSidebarFooter>
        )}
      </div>
    </RightSidebar>
  )
}
