import { api } from '@/services/api'
import type {
  NotificationApi,
  NotificationsListResponse,
  NotificationDetailsResponse,
  CreateNotificationRequest,
  CreateNotificationResponse,
  UpdateNotificationRequest,
  UpdateNotificationResponse,
} from '@/types/api'

// Notification API endpoints - matches backend /api/notification routes
export const notificationsService = {
  // Get all notifications
  getNotifications: async (): Promise<NotificationApi[]> => {
    const response = await api.get<NotificationsListResponse>('/notifications')
    return response.data.results
  },

  // Get a single notification by ID
  getNotification: async (id: number): Promise<NotificationApi> => {
    const response = await api.get<NotificationDetailsResponse>(`/notification/${id}`)
    return response.data.results
  },

  // Create a new notification
  createNotification: async (
    data: CreateNotificationRequest
  ): Promise<CreateNotificationResponse> => {
    const response = await api.post<CreateNotificationResponse>('/notification', data)
    return response.data
  },

  // Update an existing notification
  updateNotification: async (
    id: number,
    data: UpdateNotificationRequest
  ): Promise<UpdateNotificationResponse> => {
    const response = await api.patch<UpdateNotificationResponse>(`/notification/${id}`, data)
    return response.data
  },

  // Delete a notification
  deleteNotification: async (id: number): Promise<UpdateNotificationResponse> => {
    const response = await api.delete<UpdateNotificationResponse>(`/notification/${id}`)
    return response.data
  },
}
