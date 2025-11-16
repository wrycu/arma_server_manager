import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { notifications as notificationsService } from '@/services'
import { handleApiError } from '@/lib/error-handler'
import type {
  NotificationApi,
  CreateNotificationRequest,
  UpdateNotificationRequest,
} from '@/types/api'

export function useNotifications() {
  const queryClient = useQueryClient()

  const {
    data: notifications = [],
    isLoading,
    error,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsService.getNotifications,
  })

  const createNotificationMutation = useMutation({
    mutationFn: (data: CreateNotificationRequest) => notificationsService.createNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (error) => handleApiError(error, 'Failed to create notification'),
  })

  const updateNotificationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateNotificationRequest }) =>
      notificationsService.updateNotification(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (error) => handleApiError(error, 'Failed to update notification'),
  })

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: number) => notificationsService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (error) => handleApiError(error, 'Failed to delete notification'),
  })

  const createNotification = async (data: CreateNotificationRequest) => {
    return createNotificationMutation.mutateAsync(data)
  }

  const updateNotification = async (id: number, data: UpdateNotificationRequest) => {
    return updateNotificationMutation.mutateAsync({ id, data })
  }

  const deleteNotification = async (id: number) => {
    return deleteNotificationMutation.mutateAsync(id)
  }

  return {
    // Data
    notifications: notifications as NotificationApi[],

    // Loading and error state
    isLoading,
    error,

    // Actions
    createNotification,
    updateNotification,
    deleteNotification,
    refetchNotifications,

    // Mutation state
    isCreating: createNotificationMutation.isPending,
    isUpdating: updateNotificationMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
  }
}
