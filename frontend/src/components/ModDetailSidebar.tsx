import { useState, useEffect, useCallback } from 'react'
import {
  IconCheck,
  IconDownload,
  IconTrash,
  IconExternalLink,
  IconCloudDownload,
  IconAlertCircle,
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
import type { ModSubscription } from '@/types/mods'
import { BACKEND_BASE_URL } from '@/services/api'
import { formatDate } from '@/lib/date'

interface ModDetailSidebarProps {
  mod: ModSubscription | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRemove?: () => void
  onSave?: (steamId: number, updates: { isServerMod: boolean }) => Promise<void>
  onDownload?: (steamId: number) => void
  onDelete?: (steamId: number) => void
  onUninstall?: (steamId: number) => void
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

  // Reset form when mod changes or sidebar closes
  useEffect(() => {
    if (mod && open) {
      setEditedIsServerMod(mod.isServerMod)
      setIsDirty(false)
      setShowDeleteConfirm(false)
      setShowUninstallConfirm(false)
    }
  }, [mod, open])

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
          {/* Delete Confirmation (inline) */}
          {showDeleteConfirm && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <h3 className="text-sm font-medium text-destructive mb-1">
                {onRemove ? 'Remove from Collection?' : 'Delete Subscription?'}
              </h3>
              <p className="text-xs text-muted-foreground mb-2.5">
                {onRemove
                  ? 'This will remove the mod from this collection. The mod files will remain.'
                  : 'This will permanently delete the mod subscription. This action cannot be undone.'}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onRemove ? handleRemove : handleDelete}
                  className="h-8"
                >
                  {onRemove ? 'Remove' : 'Delete'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-8"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Uninstall Confirmation (inline) */}
          {showUninstallConfirm && (
            <div className="rounded-md border border-orange-500/30 bg-orange-500/5 p-3">
              <h3 className="text-sm font-medium text-orange-600 mb-1">Uninstall Local Files?</h3>
              <p className="text-xs text-muted-foreground mb-2.5">
                This will delete the local mod files but keep your subscription. You can re-download
                the mod at any time.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUninstall}
                  className="h-8 border-orange-500/30 text-orange-600 hover:bg-orange-500/10"
                >
                  Uninstall
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUninstallConfirm(false)}
                  className="h-8"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Mod Image */}
          {mod.imageAvailable && (
            <div className="w-full aspect-video rounded-md overflow-hidden bg-muted -mt-1">
              <img
                src={`${BACKEND_BASE_URL}/api/arma3/mod/subscription/${mod.id}/image`}
                alt={mod.name}
                className="w-full h-full object-contain"
                crossOrigin="anonymous"
              />
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
                  mod.shouldUpdate ? (
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
                <Button onClick={handleSave} disabled={isSaving} size="sm" className="w-full h-8">
                  <IconCheck className="h-3.5 w-3.5 mr-1.5" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </div>
          )}
        </RightSidebarContent>

        {/* FOOTER: Primary Actions */}
        {(onDownload || onRemove || onDelete || onUninstall) &&
          !showDeleteConfirm &&
          !showUninstallConfirm && (
            <RightSidebarFooter>
              <div className="space-y-1.5">
                {/* Primary action: Download */}
                {onDownload && !mod.localPath && (
                  <Button
                    variant="default"
                    className="w-full h-8"
                    size="sm"
                    onClick={() => onDownload(mod.steamId)}
                  >
                    <IconDownload className="h-3.5 w-3.5 mr-2" />
                    Download Mod
                  </Button>
                )}

                {/* Uninstall local files (keeps subscription) */}
                {onUninstall && mod.localPath && (
                  <Button
                    variant="outline"
                    className="w-full h-8 border-orange-500/30 text-orange-600 hover:bg-orange-500/10 hover:text-orange-600"
                    size="sm"
                    onClick={() => setShowUninstallConfirm(true)}
                  >
                    <IconTrash className="h-3.5 w-3.5 mr-2" />
                    Uninstall Local Files
                  </Button>
                )}

                {/* Collection context: Remove from collection */}
                {onRemove && (
                  <Button
                    variant="ghost"
                    className="w-full h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <IconTrash className="h-3.5 w-3.5 mr-2" />
                    Remove from Collection
                  </Button>
                )}

                {/* Mod subscription context: Delete subscription */}
                {onDelete && !onRemove && (
                  <Button
                    variant="ghost"
                    className="w-full h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <IconTrash className="h-3.5 w-3.5 mr-2" />
                    Delete Subscription
                  </Button>
                )}
              </div>
            </RightSidebarFooter>
          )}
      </div>
    </RightSidebar>
  )
}
