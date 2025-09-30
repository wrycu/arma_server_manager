import { useState } from 'react'
import { Clock, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/PageTitle'

import { SchedulesDataTable } from '@/components/SchedulesDataTable'
import { CreateScheduleDialog } from '@/components/SchedulesCreateDialog'
import { EditScheduleDialog } from '@/components/SchedulesEditDialog'
import { getColumns } from '@/components/SchedulesColumns'
import { useSchedules } from '@/hooks/useSchedules'
import type { Schedule } from '@/types/server'

export function SchedulesManager() {
  const {
    schedules,
    isLoading,
    createSchedule,
    updateSchedule,
    executeSchedule,
    deleteSchedule,
    isCreating,
    isUpdating,
  } = useSchedules()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)

  const handleCreateSchedule = async (scheduleData: {
    name: string
    action: string
    celeryName: string
  }) => {
    try {
      await createSchedule({
        name: scheduleData.name.trim(),
        action: scheduleData.action,
        celeryName: scheduleData.celeryName,
        enabled: true,
      })
      setCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create schedule:', error)
    }
  }

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setEditDialogOpen(true)
  }

  const handleUpdateSchedule = async (
    id: number,
    scheduleData: {
      name: string
      action: string
      celeryName: string
      enabled: boolean
    }
  ) => {
    try {
      await updateSchedule(id, {
        name: scheduleData.name.trim(),
        action: scheduleData.action,
        celery_name: scheduleData.celeryName,
        enabled: scheduleData.enabled,
      })

      setEditDialogOpen(false)
      setEditingSchedule(null)
    } catch (error) {
      console.error('Failed to update schedule:', error)
    }
  }

  const columns = getColumns({
    onExecute: async (id) => {
      await executeSchedule(id)
    },
    onEdit: handleEditSchedule,
    onDelete: async (id) => {
      await deleteSchedule(id)
    },
    isLoading,
  })

  return (
    <div className="space-y-6">
      <PageTitle
        title="Schedules"
        description="Manage automated server operations and schedules"
        actions={
          <CreateScheduleDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onCreateSchedule={handleCreateSchedule}
            isCreating={isCreating}
            trigger={
              <Button size="sm" className="h-7 px-3 text-xs">
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>
            }
          />
        }
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {schedules.length} schedule{schedules.length !== 1 ? 's' : ''} configured
            </span>
          </div>
        </div>

        <SchedulesDataTable
          {...{
            columns,
            data: schedules,
            isLoading,
          }}
        />
      </div>

      <EditScheduleDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        schedule={editingSchedule}
        onUpdateSchedule={handleUpdateSchedule}
        isUpdating={isUpdating}
      />
    </div>
  )
}
