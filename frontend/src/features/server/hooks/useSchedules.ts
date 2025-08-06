import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { schedules } from "@/services"
import type { Schedule, ScheduleOperationType, ScheduleStatus } from "../types"
import type {
  ScheduleResponse,
  CreateScheduleRequest,
  UpdateScheduleRequest,
} from "@/types/api"

// Transform API response to local types
const transformScheduleResponse = (apiSchedule: ScheduleResponse): Schedule => ({
  id: apiSchedule.id,
  name: apiSchedule.name,
  description: apiSchedule.description,
  operationType: apiSchedule.operationType as ScheduleOperationType,
  frequency: apiSchedule.frequency,
  cronExpression: apiSchedule.cronExpression,
  nextRun: apiSchedule.nextRun,
  lastRun: apiSchedule.lastRun,
  status: apiSchedule.status as ScheduleStatus,
  operationData: apiSchedule.operationData,
  createdAt: apiSchedule.createdAt,
  updatedAt: apiSchedule.updatedAt,
})

export function useSchedules() {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  // Fetch all schedules
  const {
    data: schedulesData = [],
    isLoading: isSchedulesLoading,
    error: schedulesError,
    refetch: refetchSchedules,
  } = useQuery({
    queryKey: ["schedules"],
    queryFn: schedules.getSchedules,
    select: (data: ScheduleResponse[]) => data.map(transformScheduleResponse),
  })

  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: (scheduleData: CreateScheduleRequest) =>
      schedules.createSchedule(scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] })
    },
    onMutate: () => setIsLoading("create"),
    onSettled: () => setIsLoading(null),
  })

  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateScheduleRequest }) =>
      schedules.updateSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] })
    },
    onMutate: () => setIsLoading("update"),
    onSettled: () => setIsLoading(null),
  })

  // Delete schedule mutation
  const deleteScheduleMutation = useMutation({
    mutationFn: (id: number) => schedules.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] })
    },
    onMutate: () => setIsLoading("delete"),
    onSettled: () => setIsLoading(null),
  })

  // Toggle schedule mutation
  const toggleScheduleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      schedules.toggleSchedule(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] })
    },
    onMutate: () => setIsLoading("toggle"),
    onSettled: () => setIsLoading(null),
  })

  // Execute schedule mutation
  const executeScheduleMutation = useMutation({
    mutationFn: (id: number) => schedules.executeSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] })
    },
    onMutate: () => setIsLoading("execute"),
    onSettled: () => setIsLoading(null),
  })

  // Action functions
  const createSchedule = useCallback(
    async (
      scheduleData: Omit<
        Schedule,
        "id" | "createdAt" | "updatedAt" | "cronExpression" | "nextRun" | "lastRun"
      >,
    ) => {
      const createRequest: CreateScheduleRequest = {
        name: scheduleData.name,
        description: scheduleData.description,
        operationType: scheduleData.operationType,
        frequency: scheduleData.frequency,
        operationData: scheduleData.operationData,
      }

      return createScheduleMutation.mutateAsync(createRequest)
    },
    [createScheduleMutation],
  )

  const updateSchedule = useCallback(
    async (id: number, updates: Partial<Schedule>) => {
      const updateRequest: UpdateScheduleRequest = {
        name: updates.name,
        description: updates.description,
        frequency: updates.frequency,
        status: updates.status,
        operationData: updates.operationData,
      }

      return updateScheduleMutation.mutateAsync({ id, data: updateRequest })
    },
    [updateScheduleMutation],
  )

  const deleteSchedule = useCallback(
    async (id: number) => {
      return deleteScheduleMutation.mutateAsync(id)
    },
    [deleteScheduleMutation],
  )

  const toggleSchedule = useCallback(
    async (id: number, enabled: boolean) => {
      return toggleScheduleMutation.mutateAsync({ id, enabled })
    },
    [toggleScheduleMutation],
  )

  const executeSchedule = useCallback(
    async (id: number) => {
      return executeScheduleMutation.mutateAsync(id)
    },
    [executeScheduleMutation],
  )

  const refreshSchedules = useCallback(async () => {
    return refetchSchedules()
  }, [refetchSchedules])

  // Helper functions
  const getActiveSchedules = useCallback(() => {
    return schedulesData.filter(schedule => schedule.status === "active")
  }, [schedulesData])

  const getSchedulesByType = useCallback(
    (operationType: ScheduleOperationType) => {
      return schedulesData.filter(schedule => schedule.operationType === operationType)
    },
    [schedulesData],
  )

  const getUpcomingSchedules = useCallback(() => {
    return schedulesData
      .filter(schedule => schedule.status === "active" && schedule.nextRun)
      .sort((a, b) => new Date(a.nextRun).getTime() - new Date(b.nextRun).getTime())
  }, [schedulesData])

  return {
    // Data
    schedules: schedulesData,

    // Loading states
    isLoading: isSchedulesLoading || isLoading !== null,
    isSchedulesLoading,
    loadingAction: isLoading,
    error: schedulesError,

    // Actions
    createSchedule,
    updateSchedule,
    deleteSchedule,
    toggleSchedule,
    executeSchedule,
    refreshSchedules,

    // Helper functions
    getActiveSchedules,
    getSchedulesByType,
    getUpcomingSchedules,

    // Mutation states
    isCreating: createScheduleMutation.isPending,
    isUpdating: updateScheduleMutation.isPending,
    isDeleting: deleteScheduleMutation.isPending,
    isToggling: toggleScheduleMutation.isPending,
    isExecuting: executeScheduleMutation.isPending,
  }
}
