import { api } from '../api'
import type {
  ScheduleResponse,
  SchedulesListResponse,
  CreateScheduleRequest,
  CreateScheduleResponse,
  UpdateScheduleRequest,
  UpdateScheduleResponse,
} from '@/types/api'

// Schedule API endpoints
export const scheduleService = {
  // Get all schedules
  getSchedules: async (): Promise<ScheduleResponse[]> => {
    const response = await api.get<SchedulesListResponse>('/server/schedules')
    return response.data.results
  },

  // Get schedule by ID
  getSchedule: async (id: number): Promise<ScheduleResponse> => {
    const response = await api.get<ScheduleResponse>(`/server/schedules/${id}`)
    return response.data
  },

  // Create new schedule
  createSchedule: async (
    scheduleData: CreateScheduleRequest
  ): Promise<ScheduleResponse> => {
    const response = await api.post<CreateScheduleResponse>(
      '/server/schedules',
      scheduleData
    )
    return response.data.results
  },

  // Update schedule
  updateSchedule: async (
    id: number,
    scheduleData: UpdateScheduleRequest
  ): Promise<ScheduleResponse> => {
    const response = await api.patch<UpdateScheduleResponse>(
      `/server/schedules/${id}`,
      scheduleData
    )
    return response.data.results
  },

  // Delete schedule
  deleteSchedule: async (id: number): Promise<void> => {
    await api.delete(`/server/schedules/${id}`)
  },

  // Enable/disable schedule
  toggleSchedule: async (id: number, enabled: boolean): Promise<ScheduleResponse> => {
    const response = await api.patch<UpdateScheduleResponse>(
      `/server/schedules/${id}`,
      { status: enabled ? 'active' : 'inactive' }
    )
    return response.data.results
  },

  // Execute schedule immediately (manual trigger)
  executeSchedule: async (id: number): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      `/server/schedules/${id}/execute`
    )
    return response.data
  },
}
