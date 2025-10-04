import { useState } from 'react'
import { Clock, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/PageTitle'

import { SchedulesDataTable } from '@/components/SchedulesDataTable'
import { CreateScheduleDialog } from '@/components/SchedulesCreateDialog'
import { ScheduleDetailSidebar } from '@/components/ScheduleDetailSidebar'
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
  } = useSchedules()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Sidebar state
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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

  const handleRowClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setIsSidebarOpen(true)
  }

  const handleSave = async (
    id: number,
    updates: {
      name: string
      action: string
      celeryName: string
      enabled: boolean
    }
  ) => {
    await updateSchedule(id, {
      name: updates.name.trim(),
      action: updates.action,
      celery_name: updates.celeryName,
      enabled: updates.enabled,
    })
    toast.success('Schedule updated successfully')
  }

  const handleExecute = async (id: number) => {
    await executeSchedule(id)
    toast.success('Schedule executed successfully')
  }

  const handleDelete = async (id: number) => {
    await deleteSchedule(id)
    setIsSidebarOpen(false)
    toast.success('Schedule deleted successfully')
  }

  const columns = getColumns()

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
            onRowClick: handleRowClick,
          }}
        />
      </div>

      <ScheduleDetailSidebar
        schedule={selectedSchedule}
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        onSave={handleSave}
        onExecute={handleExecute}
        onDelete={handleDelete}
      />
    </div>
  )
}
