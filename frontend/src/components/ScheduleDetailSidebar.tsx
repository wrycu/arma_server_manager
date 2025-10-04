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
import { Kbd } from '@/components/ui/kbd'
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
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <IconClock className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold truncate">{schedule.name}</h2>
            </div>
            <Badge variant={getStatusBadgeVariant(schedule.enabled)} className="capitalize">
              {getStatusText(schedule.enabled)}
            </Badge>
          </div>
        </RightSidebarHeader>

        {/* CONTENT: All information always visible */}
        <RightSidebarContent>
          {/* Delete Confirmation (inline) */}
          {showDeleteConfirm && (
            <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <h3 className="text-sm font-semibold text-destructive mb-2">Delete Schedule?</h3>
              <p className="text-xs text-muted-foreground mb-3">
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

          <div className="space-y-6">
            {/* Metadata Grid - 2 columns */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Action</p>
                <p className="font-medium">{getActionLabel(schedule.action)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Frequency</p>
                <p className="font-medium">{frequencyLabel}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="font-medium">{formatDateTime(schedule.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Updated</p>
                <p className="font-medium">{formatDateTime(schedule.updated_at)}</p>
              </div>
            </div>

            {/* Editable Configuration - Inline, no box */}
            {onSave && (
              <div className="space-y-3 pt-2">
                {/* Name Input */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm">
                    Schedule Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Nightly Server Restart"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                  />
                </div>

                {/* Action Select */}
                <div className="space-y-1.5">
                  <Label htmlFor="action" className="text-sm">
                    Action
                  </Label>
                  <Select value={editedAction} onValueChange={setEditedAction}>
                    <SelectTrigger>
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
                <div className="space-y-1.5">
                  <Label htmlFor="frequency" className="text-sm">
                    Frequency
                  </Label>
                  <Select value={editedCeleryName} onValueChange={setEditedCeleryName}>
                    <SelectTrigger>
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
                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-sm">
                    Status
                  </Label>
                  <Select
                    value={editedEnabled ? 'active' : 'inactive'}
                    onValueChange={(value) => setEditedEnabled(value === 'active')}
                  >
                    <SelectTrigger>
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
          </div>
        </RightSidebarContent>

        {/* FOOTER: Primary Actions (Sticky) */}
        {(onExecute || onDelete) && !showDeleteConfirm && (
          <RightSidebarFooter>
            <div className="space-y-2">
              {/* Execute action */}
              {onExecute && (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={handleExecute}
                  disabled={isExecuting}
                >
                  <IconPlayerPlay className="h-4 w-4 mr-2" />
                  {isExecuting ? 'Executing...' : 'Execute Now'}
                </Button>
              )}

              {/* Delete action */}
              {onDelete && (
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <IconTrash className="h-4 w-4 mr-2" />
                  Delete Schedule
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
