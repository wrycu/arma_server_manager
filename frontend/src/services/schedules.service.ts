import { api } from '@/services/api'
import type {
  ScheduleResponse,
  SchedulesListResponse,
  CreateScheduleRequest,
  CreateScheduleResponse,
  UpdateScheduleRequest,
  UpdateScheduleResponse,
  TriggerScheduleResponse,
} from '@/types/api'

// Schedule API endpoints - matches backend api.py routes
export const scheduleService = {
  // Get all schedules
  getSchedules: async (): Promise<ScheduleResponse[]> => {
    const response = await api.get<SchedulesListResponse>('/schedules')
    return response.data.results
  },

  // Get schedule by ID
  getSchedule: async (id: number): Promise<ScheduleResponse> => {
    const response = await api.get<{ message: string; results: ScheduleResponse }>(
      `/schedule/${id}`
    )
    return response.data.results
  },

  // Create new schedule
  createSchedule: async (scheduleData: CreateScheduleRequest): Promise<number> => {
    const response = await api.post<CreateScheduleResponse>('/schedule', scheduleData)
    return response.data.result
  },

  // Update schedule
  updateSchedule: async (id: number, scheduleData: UpdateScheduleRequest): Promise<void> => {
    await api.patch<UpdateScheduleResponse>(`/schedule/${id}`, scheduleData)
  },

  // Delete schedule
  deleteSchedule: async (id: number): Promise<void> => {
    await api.delete(`/schedule/${id}`)
  },

  // Enable/disable schedule
  toggleSchedule: async (id: number, enabled: boolean): Promise<void> => {
    await api.patch<UpdateScheduleResponse>(`/schedule/${id}`, {
      enabled,
    })
  },

  // Execute schedule immediately (manual trigger)
  executeSchedule: async (id: number): Promise<{ message: string }> => {
    const response = await api.post<TriggerScheduleResponse>(`/schedule/${id}/trigger`)
    return response.data
  },
}
