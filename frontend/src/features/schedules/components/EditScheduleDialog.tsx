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
import type { Schedule, ScheduleOperationType } from '../../server/types'

const operationTypeOptions = [
  { value: 'restart', label: 'Restart Server' },
  { value: 'backup', label: 'Create Backup' },
  { value: 'mod_update', label: 'Update Mods' },
  { value: 'stop', label: 'Stop Server' },
  { value: 'start', label: 'Start Server' },
] as const

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
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
      operationType: ScheduleOperationType
      frequency: string
      status: string
    },
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
    operationType: 'restart' as ScheduleOperationType,
    frequency: '',
    status: 'active',
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Update form data when schedule changes
  React.useEffect(() => {
    if (schedule) {
      setFormData({
        name: schedule.name,
        operationType: schedule.operationType,
        frequency: schedule.frequency,
        status: schedule.status,
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
    if (!formData.frequency.trim()) {
      newErrors.frequency = 'Frequency is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await onUpdateSchedule(schedule.id, {
        name: formData.name,
        operationType: formData.operationType,
        frequency: formData.frequency,
        status: formData.status,
      })

      onOpenChange(false)
    } catch (error) {
      console.error('Failed to update schedule:', error)
    }
  }

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
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
                onChange={e => updateFormData('name', e.target.value)}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="operation">Operation Type</Label>
                <Select
                  value={formData.operationType}
                  onValueChange={(value: ScheduleOperationType) =>
                    updateFormData('operationType', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operationTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={value => updateFormData('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Input
                id="frequency"
                placeholder="e.g., every 2 hours, daily at 3am"
                value={formData.frequency}
                onChange={e => updateFormData('frequency', e.target.value)}
                className={errors.frequency ? 'border-destructive' : ''}
              />
              {errors.frequency && (
                <p className="text-sm text-destructive">{errors.frequency}</p>
              )}
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
                isUpdating || !formData.name.trim() || !formData.frequency.trim()
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
