import { useState, useEffect, useCallback } from 'react'
import { IconCheck, IconDownload, IconTrash, IconExternalLink, IconX } from '@tabler/icons-react'

import {
  RightSidebar,
  RightSidebarHeader,
  RightSidebarContent,
  RightSidebarFooter,
} from '@/components/ui/right-sidebar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Kbd } from '@/components/ui/kbd'
import type { ModSubscription } from '@/types/mods'

interface ModDetailSidebarProps {
  mod: ModSubscription | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRemove?: () => void
  onSave?: (
    steamId: number,
    updates: { arguments: string | null; isServerMod: boolean }
  ) => Promise<void>
  onDownload?: (steamId: number) => void
  onDelete?: (steamId: number) => void
}

export function ModDetailSidebar({
  mod,
  open,
  onOpenChange,
  onRemove,
  onSave,
  onDownload,
  onDelete,
}: ModDetailSidebarProps) {
  // Form state
  const [editedArguments, setEditedArguments] = useState<string>('')
  const [editedIsServerMod, setEditedIsServerMod] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState(false)

  // Track if form has been modified
  const [isDirty, setIsDirty] = useState(false)

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Reset form when mod changes or sidebar closes
  useEffect(() => {
    if (mod && open) {
      setEditedArguments(mod.arguments || '')
      setEditedIsServerMod(mod.isServerMod)
      setIsDirty(false)
      setShowDeleteConfirm(false)
    }
  }, [mod, open])

  // Check if form has been modified
  useEffect(() => {
    if (mod) {
      const argumentsChanged = (editedArguments.trim() || null) !== (mod.arguments || null)
      const serverModChanged = editedIsServerMod !== mod.isServerMod
      setIsDirty(argumentsChanged || serverModChanged)
    }
  }, [editedArguments, editedIsServerMod, mod])

  const handleSave = useCallback(async () => {
    if (!mod || !onSave || !isDirty) return

    setIsSaving(true)
    try {
      await onSave(mod.steamId, {
        arguments: editedArguments.trim() || null,
        isServerMod: editedIsServerMod,
      })
      // Form is no longer dirty after successful save
      setIsDirty(false)
    } catch (error) {
      console.error('Failed to save mod updates:', error)
    } finally {
      setIsSaving(false)
    }
  }, [mod, onSave, isDirty, editedArguments, editedIsServerMod])

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

  if (!mod) return null

  return (
    <RightSidebar open={open} onOpenChange={onOpenChange}>
      <div className="flex flex-col h-full">
        {/* HEADER: Title and Close */}
        <RightSidebarHeader onClose={() => onOpenChange(false)}>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold truncate">{mod.name}</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {mod.isServerMod && <span>Server Mod</span>}
              {mod.isServerMod && mod.modType && <span>•</span>}
              {mod.modType && <span className="capitalize">{mod.modType}</span>}
            </div>
          </div>
        </RightSidebarHeader>

        {/* CONTENT: All information always visible */}
        <RightSidebarContent>
          {/* Delete Confirmation (inline) */}
          {showDeleteConfirm && (
            <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <h3 className="text-sm font-semibold text-destructive mb-2">
                {onRemove ? 'Remove from Collection?' : 'Delete Subscription?'}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {onRemove
                  ? 'This will remove the mod from this collection. The mod files will remain.'
                  : 'This will permanently delete the mod subscription. This action cannot be undone.'}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onRemove ? handleRemove : handleDelete}
                >
                  {onRemove ? 'Remove' : 'Delete'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Mod Image */}
            {mod.imageAvailable && (
              <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={`/api/arma3/mod/subscription/${mod.id}/image`}
                  alt={mod.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Metadata Grid - 2 columns for efficiency */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Workshop ID</p>
                <p className="font-medium">{mod.steamId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Downloaded</p>
                <div className="flex items-center gap-1.5">
                  {mod.localPath ? (
                    <>
                      <IconDownload className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-green-500">Yes</span>
                    </>
                  ) : (
                    <>
                      <IconX className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">No</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Size</p>
                <p className="font-medium">{mod.size}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {mod.lastUpdated ? new Date(mod.lastUpdated).toLocaleDateString() : 'Never'}
                </p>
              </div>
              {mod.steamLastUpdated && (
                <div>
                  <p className="text-xs text-muted-foreground">Steam Updated</p>
                  <p className="font-medium">
                    {new Date(mod.steamLastUpdated).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Filename</p>
                <p className="font-medium break-all">{mod.filename}</p>
              </div>
              {mod.localPath && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Local Path</p>
                  <p className="font-medium break-all text-xs">{mod.localPath}</p>
                </div>
              )}
            </div>

            {/* Editable Configuration - Inline, no box */}
            {onSave && (
              <div className="space-y-3 pt-2">
                {/* Server Mod Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="server-mod"
                    checked={editedIsServerMod}
                    onCheckedChange={(checked) => setEditedIsServerMod(checked as boolean)}
                  />
                  <Label htmlFor="server-mod" className="text-sm cursor-pointer">
                    Server-side only mod
                  </Label>
                </div>

                {/* Arguments Textarea */}
                <div className="space-y-1.5">
                  <Label htmlFor="arguments" className="text-sm">
                    Arguments
                  </Label>
                  <Textarea
                    id="arguments"
                    placeholder="-serverMod"
                    value={editedArguments}
                    onChange={(e) => setEditedArguments(e.target.value)}
                    rows={2}
                    className="font-mono text-xs resize-none"
                  />
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

            {/* Steam Workshop Link */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() =>
                window.open(
                  `https://steamcommunity.com/sharedfiles/filedetails/?id=${mod.steamId}`,
                  '_blank'
                )
              }
            >
              <IconExternalLink className="h-3.5 w-3.5 mr-1.5" />
              View on Steam Workshop
            </Button>
          </div>
        </RightSidebarContent>

        {/* FOOTER: Primary Actions (Sticky) */}
        {(onDownload || onRemove || onDelete) && !showDeleteConfirm && (
          <RightSidebarFooter>
            <div className="space-y-2">
              {/* Primary action: Download */}
              {onDownload && !mod.localPath && (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => onDownload(mod.steamId)}
                >
                  <IconDownload className="h-4 w-4 mr-2" />
                  Download Mod
                </Button>
              )}

              {/* Collection context: Remove from collection */}
              {onRemove && (
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <IconTrash className="h-4 w-4 mr-2" />
                  Remove from Collection
                </Button>
              )}

              {/* Mod subscription context: Delete subscription */}
              {onDelete && !onRemove && (
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <IconTrash className="h-4 w-4 mr-2" />
                  Delete Subscription
                </Button>
              )}
            </div>
          </RightSidebarFooter>
        )}

        {/* Keyboard Shortcut Hint */}
        <div className="px-6 pb-4 text-xs text-muted-foreground text-center space-x-3">
          <span>
            <Kbd>Esc</Kbd> to close
          </span>
          {isDirty && (
            <span>
              <Kbd>⌘S</Kbd> to save
            </span>
          )}
        </div>
      </div>
    </RightSidebar>
  )
}
