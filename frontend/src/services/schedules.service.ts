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

// Schedule API endpoints - matches backend arma3.py routes
export const scheduleService = {
  // Get all schedules
  getSchedules: async (): Promise<ScheduleResponse[]> => {
    const response = await api.get<SchedulesListResponse>('/arma3/schedules')
    return response.data.results
  },

  // Get schedule by ID
  getSchedule: async (id: number): Promise<ScheduleResponse> => {
    const response = await api.get<{ message: string; results: ScheduleResponse }>(
      `/arma3/schedule/${id}`
    )
    return response.data.results
  },

  // Create new schedule
  createSchedule: async (scheduleData: CreateScheduleRequest): Promise<number> => {
    const response = await api.post<CreateScheduleResponse>('/arma3/schedule', scheduleData)
    return response.data.result
  },

  // Update schedule
  updateSchedule: async (id: number, scheduleData: UpdateScheduleRequest): Promise<void> => {
    await api.patch<UpdateScheduleResponse>(`/arma3/schedule/${id}`, scheduleData)
  },

  // Delete schedule
  deleteSchedule: async (id: number): Promise<void> => {
    await api.delete(`/arma3/schedule/${id}`)
  },

  // Enable/disable schedule
  toggleSchedule: async (id: number, enabled: boolean): Promise<void> => {
    await api.patch<UpdateScheduleResponse>(`/arma3/schedule/${id}`, {
      enabled,
    })
  },

  // Execute schedule immediately (manual trigger)
  executeSchedule: async (id: number): Promise<{ message: string }> => {
    const response = await api.post<TriggerScheduleResponse>(`/arma3/schedule/${id}/trigger`)
    return response.data
  },
}
