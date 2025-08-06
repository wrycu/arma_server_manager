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
  DialogTrigger,
} from '@/components/ui/dialog'
import type { ScheduleOperationType } from '../../server/types'

const operationTypeOptions = [
  { value: 'restart', label: 'Restart Server' },
  { value: 'backup', label: 'Create Backup' },
  { value: 'mod_update', label: 'Update Mods' },
  { value: 'stop', label: 'Stop Server' },
  { value: 'start', label: 'Start Server' },
] as const

interface CreateScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateSchedule: (data: {
    name: string
    operationType: ScheduleOperationType
    frequency: string
  }) => Promise<void>
  isCreating: boolean
  trigger?: React.ReactNode
}

export function CreateScheduleDialog({
  open,
  onOpenChange,
  onCreateSchedule,
  isCreating,
  trigger,
}: CreateScheduleDialogProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    operationType: 'restart' as ScheduleOperationType,
    frequency: '',
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
      await onCreateSchedule({
        name: formData.name,
        operationType: formData.operationType,
        frequency: formData.frequency,
      })

      // Reset form on success
      setFormData({
        name: '',
        operationType: 'restart',
        frequency: '',
      })
      setErrors({})
    } catch (error) {
      console.error('Failed to create schedule:', error)
    }
  }

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Create New Schedule
            </DialogTitle>
            <DialogDescription>
              Create an automated schedule for server operations. The schedule will run
              based on the frequency you specify.
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
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isCreating || !formData.name.trim() || !formData.frequency.trim()
              }
            >
              {isCreating ? 'Creating...' : 'Create Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
