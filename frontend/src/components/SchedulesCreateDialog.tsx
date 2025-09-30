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

interface CreateScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateSchedule: (data: { name: string; action: string; celeryName: string }) => Promise<void>
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
    action: 'server_restart',
    celeryName: 'every_hour',
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
      await onCreateSchedule({
        name: formData.name,
        action: formData.action,
        celeryName: formData.celeryName,
      })

      // Reset form on success
      setFormData({
        name: '',
        action: 'server_restart',
        celeryName: 'every_hour',
      })
      setErrors({})
    } catch (error) {
      console.error('Failed to create schedule:', error)
    }
  }

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit} key={open ? 'create-schedule-form' : 'closed'}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Create New Schedule
            </DialogTitle>
            <DialogDescription>
              Create an automated schedule for server operations. The schedule will run based on the
              frequency you specify.
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
                isCreating ||
                !formData.name.trim() ||
                !formData.action.trim() ||
                !formData.celeryName.trim()
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
