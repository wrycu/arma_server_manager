import { useState, useEffect, useCallback } from 'react'
import { IconCheck, IconTrash, IconFolder } from '@tabler/icons-react'

import {
  RightSidebar,
  RightSidebarHeader,
  RightSidebarContent,
  RightSidebarFooter,
} from '@/components/ui/right-sidebar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { Collection } from '@/types/collections'
import { formatDateTime } from '@/lib/date'

interface CollectionDetailSidebarProps {
  collection: Collection | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (id: number, updates: { name: string; description: string }) => Promise<void>
  onSetActive?: (collection: Collection) => void
  onDelete?: (id: number) => Promise<void>
  isActive?: boolean
}

export function CollectionDetailSidebar({
  collection,
  open,
  onOpenChange,
  onSave,
  onSetActive,
  onDelete,
  isActive = false,
}: CollectionDetailSidebarProps) {
  // Form state
  const [editedName, setEditedName] = useState<string>('')
  const [editedDescription, setEditedDescription] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)

  // Track if form has been modified
  const [isDirty, setIsDirty] = useState(false)

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Reset form when collection changes or sidebar closes
  useEffect(() => {
    if (collection && open) {
      setEditedName(collection.name)
      setEditedDescription(collection.description || '')
      setIsDirty(false)
      setShowDeleteConfirm(false)
    }
  }, [collection, open])

  // Check if form has been modified
  useEffect(() => {
    if (collection) {
      const nameChanged = editedName.trim() !== collection.name
      const descriptionChanged = editedDescription.trim() !== (collection.description || '')
      setIsDirty(nameChanged || descriptionChanged)
    }
  }, [editedName, editedDescription, collection])

  const handleSave = useCallback(async () => {
    if (!collection || !onSave || !isDirty) return

    setIsSaving(true)
    try {
      await onSave(collection.id, {
        name: editedName.trim(),
        description: editedDescription.trim(),
      })
      // Form is no longer dirty after successful save
      setIsDirty(false)
    } catch (error) {
      console.error('Failed to save collection updates:', error)
    } finally {
      setIsSaving(false)
    }
  }, [collection, onSave, isDirty, editedName, editedDescription])

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

  const handleSetActive = () => {
    if (collection && onSetActive) {
      onSetActive(collection)
    }
  }

  const handleDelete = () => {
    if (onDelete && collection) {
      onDelete(collection.id)
      setShowDeleteConfirm(false)
      onOpenChange(false)
    }
  }

  if (!collection) return null

  const modsCount = collection.mods?.length || 0

  return (
    <RightSidebar open={open} onOpenChange={onOpenChange}>
      <div className="flex flex-col h-full">
        {/* HEADER: Title and Close */}
        <RightSidebarHeader onClose={() => onOpenChange(false)}>
          <div>
            <div className="flex items-center gap-2">
              <IconFolder className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-base font-semibold truncate">{collection.name}</h2>
            </div>
            {isActive && (
              <Badge variant="default" className="capitalize mt-1">
                <IconCheck className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
          </div>
        </RightSidebarHeader>

        {/* CONTENT: All information always visible */}
        <RightSidebarContent className="space-y-5">
          {/* Delete Confirmation (inline) */}
          {showDeleteConfirm && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <h3 className="text-sm font-medium text-destructive mb-1">Delete Collection?</h3>
              <p className="text-xs text-muted-foreground mb-2.5">
                This will permanently delete this collection and remove all mod associations. This
                action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  Delete
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Metadata Grid - 2 columns */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Mods</p>
              <p className="font-medium text-sm">
                {modsCount} {modsCount === 1 ? 'mod' : 'mods'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Status</p>
              <p className="font-medium text-sm">{isActive ? 'Active' : 'Inactive'}</p>
            </div>
            {collection.created_at && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Created</p>
                <p className="font-medium text-sm">{formatDateTime(collection.created_at)}</p>
              </div>
            )}
            {collection.updated_at && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Updated</p>
                <p className="font-medium text-sm">{formatDateTime(collection.updated_at)}</p>
              </div>
            )}
          </div>

          {/* Divider before editable section */}
          {onSave && <div className="border-t -mx-6" />}

          {/* Editable Configuration */}
          {onSave && (
            <div className="space-y-2.5">
              {/* Name Input */}
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs text-muted-foreground">
                  Collection Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Core Mods"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="h-8"
                />
              </div>

              {/* Description Textarea */}
              <div className="space-y-1">
                <Label htmlFor="description" className="text-xs text-muted-foreground">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="e.g., Essential mods for the server"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="min-h-[80px] resize-none"
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
        </RightSidebarContent>

        {/* FOOTER: Primary Actions */}
        {(onSetActive || onDelete) && !showDeleteConfirm && (
          <RightSidebarFooter>
            <div className="space-y-1.5">
              {/* Set Active action */}
              {onSetActive && !isActive && (
                <Button variant="default" className="w-full" size="sm" onClick={handleSetActive}>
                  <IconCheck className="h-3.5 w-3.5 mr-2" />
                  Set as Active
                </Button>
              )}

              {/* Delete action */}
              {onDelete && (
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <IconTrash className="h-3.5 w-3.5 mr-2" />
                  Delete Collection
                </Button>
              )}
            </div>
          </RightSidebarFooter>
        )}
      </div>
    </RightSidebar>
  )
}
