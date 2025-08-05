import { useState } from 'react';
import { Clock, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/common/PageTitle';
import { useNavigation } from '@/hooks/use-navigation';

import { SchedulesDataTable } from './components/SchedulesDataTable';
import { CreateScheduleDialog } from './components/CreateScheduleDialog';
import { EditScheduleDialog } from './components/EditScheduleDialog';
import { getColumns } from './components/columns';
import { useSchedules } from '../server/hooks';
import type { Schedule, ScheduleOperationType } from '../server/types';

export function SchedulesManager() {
  const { setCurrentPage } = useNavigation();
  const {
    schedules,
    isLoading,
    createSchedule,
    executeSchedule,
    deleteSchedule,
    isCreating,
  } = useSchedules();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const handleCreateSchedule = async (scheduleData: {
    name: string;
    operationType: ScheduleOperationType;
    frequency: string;
  }) => {
    try {
      const newSchedule: Omit<
        Schedule,
        'id' | 'createdAt' | 'updatedAt' | 'cronExpression' | 'nextRun' | 'lastRun'
      > = {
        name: scheduleData.name.trim(),
        operationType: scheduleData.operationType,
        frequency: scheduleData.frequency,
        status: 'active',
        operationData: {},
      };

      await createSchedule(newSchedule);
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setEditDialogOpen(true);
  };

  const handleUpdateSchedule = async (
    id: number,
    scheduleData: {
      name: string;
      operationType: ScheduleOperationType;
      frequency: string;
      status: string;
    }
  ) => {
    try {
      // For now, log the update. This will need to be implemented in the useSchedules hook
      console.log('Updating schedule:', id, scheduleData);

      // TODO: Implement actual update functionality
      // await updateSchedule(id, scheduleData);

      setEditDialogOpen(false);
      setEditingSchedule(null);
    } catch (error) {
      console.error('Failed to update schedule:', error);
    }
  };

  const columns = getColumns({
    onExecute: async (id) => {
      await executeSchedule(id);
    },
    onEdit: handleEditSchedule,
    onDelete: async (id) => {
      await deleteSchedule(id);
    },
    isLoading,
  });

  return (
    <div className="space-y-6">
      <PageTitle
        title="Schedules"
        description="Manage automated server operations and schedules"
        breadcrumbs={[
          {
            label: 'Server',
            onClick: () => setCurrentPage('server-control'),
          },
        ]}
        actions={
          <CreateScheduleDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onCreateSchedule={handleCreateSchedule}
            isCreating={isCreating}
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
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
        isUpdating={false} // TODO: Add isUpdating state from useSchedules hook
      />
    </div>
  );
}
