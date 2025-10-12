import { useState, useEffect, useCallback } from 'react'
import { IconCheck, IconTrash, IconPlayerPlay, IconClock } from '@tabler/icons-react'

import {
  RightSidebar,
  RightSidebarHeader,
  RightSidebarContent,
  RightSidebarFooter,
} from '@/components/ui/right-sidebar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { Schedule } from '@/types/server'
import { getActionLabel, getStatusBadgeVariant, getStatusText } from '@/lib/schedules'
import { formatDateTime } from '@/lib/date'

const actionOptions = [
  { value: 'server_restart', label: 'Restart Server' },
  { value: 'server_start', label: 'Start Server' },
  { value: 'server_stop', label: 'Stop Server' },
  { value: 'mod_update', label: 'Update Mods' },
] as const

const celeryScheduleOptions = [
  { value: 'every_10_seconds', label: 'Every 10 seconds' },
  { value: 'every_hour', label: 'Every hour' },
  { value: 'every_day', label: 'Every day (6 AM)' },
  { value: 'every_sunday', label: 'Every Sunday (6 AM)' },
  { value: 'every_month', label: 'Every month (1st at 6 AM)' },
] as const

interface ScheduleDetailSidebarProps {
  schedule: Schedule | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (
    id: number,
    updates: { name: string; action: string; celeryName: string; enabled: boolean }
  ) => Promise<void>
  onExecute?: (id: number) => Promise<void>
  onDelete?: (id: number) => Promise<void>
}

export function ScheduleDetailSidebar({
  schedule,
  open,
  onOpenChange,
  onSave,
  onExecute,
  onDelete,
}: ScheduleDetailSidebarProps) {
  // Form state
  const [editedName, setEditedName] = useState<string>('')
  const [editedAction, setEditedAction] = useState<string>('server_restart')
  const [editedCeleryName, setEditedCeleryName] = useState<string>('every_hour')
  const [editedEnabled, setEditedEnabled] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)

  // Track if form has been modified
  const [isDirty, setIsDirty] = useState(false)

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Reset form when schedule changes or sidebar closes
  useEffect(() => {
    if (schedule && open) {
      setEditedName(schedule.name)
      setEditedAction(schedule.action)
      setEditedCeleryName(schedule.celery_name)
      setEditedEnabled(schedule.enabled)
      setIsDirty(false)
      setShowDeleteConfirm(false)
    }
  }, [schedule, open])

  // Check if form has been modified
  useEffect(() => {
    if (schedule) {
      const nameChanged = editedName.trim() !== schedule.name
      const actionChanged = editedAction !== schedule.action
      const celeryNameChanged = editedCeleryName !== schedule.celery_name
      const enabledChanged = editedEnabled !== schedule.enabled
      setIsDirty(nameChanged || actionChanged || celeryNameChanged || enabledChanged)
    }
  }, [editedName, editedAction, editedCeleryName, editedEnabled, schedule])

  const handleSave = useCallback(async () => {
    if (!schedule || !onSave || !isDirty) return

    setIsSaving(true)
    try {
      await onSave(schedule.id, {
        name: editedName.trim(),
        action: editedAction,
        celeryName: editedCeleryName,
        enabled: editedEnabled,
      })
      // Form is no longer dirty after successful save
      setIsDirty(false)
    } catch (error) {
      console.error('Failed to save schedule updates:', error)
    } finally {
      setIsSaving(false)
    }
  }, [schedule, onSave, isDirty, editedName, editedAction, editedCeleryName, editedEnabled])

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

  const handleExecute = async () => {
    if (!schedule || !onExecute) return
    setIsExecuting(true)
    try {
      await onExecute(schedule.id)
    } catch (error) {
      console.error('Failed to execute schedule:', error)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleDelete = () => {
    if (onDelete && schedule) {
      onDelete(schedule.id)
      setShowDeleteConfirm(false)
      onOpenChange(false)
    }
  }

  if (!schedule) return null

  const frequencyLabel =
    celeryScheduleOptions.find((opt) => opt.value === schedule.celery_name)?.label ||
    schedule.celery_name

  return (
    <RightSidebar open={open} onOpenChange={onOpenChange}>
      <div className="flex flex-col h-full">
        {/* HEADER: Title and Close */}
        <RightSidebarHeader onClose={() => onOpenChange(false)}>
          <div>
            <div className="flex items-center gap-2">
              <IconClock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-base font-semibold truncate">{schedule.name}</h2>
            </div>
            <Badge variant={getStatusBadgeVariant(schedule.enabled)} className="capitalize mt-1">
              {getStatusText(schedule.enabled)}
            </Badge>
          </div>
        </RightSidebarHeader>

        {/* CONTENT: All information always visible */}
        <RightSidebarContent className="space-y-5">
          {/* Delete Confirmation (inline) */}
          {showDeleteConfirm && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <h3 className="text-sm font-medium text-destructive mb-1">Delete Schedule?</h3>
              <p className="text-xs text-muted-foreground mb-2.5">
                This will permanently delete this schedule. This action cannot be undone.
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
              <p className="text-xs text-muted-foreground mb-0.5">Action</p>
              <p className="font-medium text-sm">{getActionLabel(schedule.action)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Frequency</p>
              <p className="font-medium text-sm">{frequencyLabel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Created</p>
              <p className="font-medium text-sm">{formatDateTime(schedule.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Updated</p>
              <p className="font-medium text-sm">{formatDateTime(schedule.updated_at)}</p>
            </div>
          </div>

          {/* Divider before editable section */}
          {onSave && <div className="border-t -mx-6" />}

          {/* Editable Configuration */}
          {onSave && (
            <div className="space-y-2.5">
              {/* Name Input */}
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs text-muted-foreground">
                  Schedule Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Nightly Server Restart"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="h-8"
                />
              </div>

              {/* Action Select */}
              <div className="space-y-1">
                <Label htmlFor="action" className="text-xs text-muted-foreground">
                  Action
                </Label>
                <Select value={editedAction} onValueChange={setEditedAction}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Frequency Select */}
              <div className="space-y-1">
                <Label htmlFor="frequency" className="text-xs text-muted-foreground">
                  Frequency
                </Label>
                <Select value={editedCeleryName} onValueChange={setEditedCeleryName}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {celeryScheduleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Select */}
              <div className="space-y-1">
                <Label htmlFor="status" className="text-xs text-muted-foreground">
                  Status
                </Label>
                <Select
                  value={editedEnabled ? 'active' : 'inactive'}
                  onValueChange={(value) => setEditedEnabled(value === 'active')}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
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
        {(onExecute || onDelete) && !showDeleteConfirm && (
          <RightSidebarFooter>
            <div className="space-y-1.5">
              {/* Execute action */}
              {onExecute && (
                <Button
                  variant="default"
                  className="w-full"
                  size="sm"
                  onClick={handleExecute}
                  disabled={isExecuting}
                >
                  <IconPlayerPlay className="h-3.5 w-3.5 mr-2" />
                  {isExecuting ? 'Executing...' : 'Execute Now'}
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
                  Delete Schedule
                </Button>
              )}
            </div>
          </RightSidebarFooter>
        )}
      </div>
    </RightSidebar>
  )
}
