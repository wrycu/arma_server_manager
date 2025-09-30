import * as React from 'react'
import { Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Schedule } from '@/types/server'

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

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
] as const

interface EditScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: Schedule | null
  onUpdateSchedule: (
    id: number,
    data: {
      name: string
      action: string
      celeryName: string
      enabled: boolean
    }
  ) => Promise<void>
  isUpdating: boolean
}

export function EditScheduleDialog({
  open,
  onOpenChange,
  schedule,
  onUpdateSchedule,
  isUpdating,
}: EditScheduleDialogProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    action: 'server_restart',
    celeryName: 'every_hour',
    enabled: true,
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Update form data when schedule changes
  React.useEffect(() => {
    if (schedule) {
      setFormData({
        name: schedule.name,
        action: schedule.action,
        celeryName: schedule.celery_name,
        enabled: schedule.enabled,
      })
      setErrors({})
    }
  }, [schedule])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!schedule) return

    // Basic validation
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Schedule name is required'
    }
    if (!formData.action.trim()) {
      newErrors.action = 'Action is required'
    }
    if (!formData.celeryName.trim()) {
      newErrors.celeryName = 'Schedule frequency is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await onUpdateSchedule(schedule.id, {
        name: formData.name,
        action: formData.action,
        celeryName: formData.celeryName,
        enabled: formData.enabled,
      })

      onOpenChange(false)
    } catch (error) {
      console.error('Failed to update schedule:', error)
    }
  }

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  if (!schedule) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Edit Schedule
            </DialogTitle>
            <DialogDescription>
              Update the schedule configuration. Changes will take effect immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Schedule Name</Label>
              <Input
                id="name"
                placeholder="e.g., Nightly Server Restart"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="action">Action</Label>
              <Select
                value={formData.action}
                onValueChange={(value) => updateFormData('action', value)}
              >
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
              {errors.action && <p className="text-sm text-destructive">{errors.action}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="celeryName">Schedule Frequency</Label>
              <Select
                value={formData.celeryName}
                onValueChange={(value) => updateFormData('celeryName', value)}
              >
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
              {errors.celeryName && <p className="text-sm text-destructive">{errors.celeryName}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="enabled">Status</Label>
              <Select
                value={formData.enabled ? 'active' : 'inactive'}
                onValueChange={(value) => updateFormData('enabled', value === 'active')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isUpdating ||
                !formData.name.trim() ||
                !formData.action.trim() ||
                !formData.celeryName.trim()
              }
            >
              {isUpdating ? 'Updating...' : 'Update Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
