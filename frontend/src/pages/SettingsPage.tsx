import { useState, useEffect } from 'react'
import { IconDeviceFloppy } from '@tabler/icons-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/PageTitle'
import { NotificationSettings } from '@/components/NotificationSettings'
import { notificationsService } from '@/services/notifications.service'
import { handleApiError } from '@/lib/error-handler'
import type { SettingsData } from '@/types/settings'

// Default initial data for new configurations
const getInitialSettings = (): SettingsData => ({
  notifications: {
    enableNotifications: true,
    webhookUrl: '',
    notificationTypes: {
      serverStartStop: true,
      modUpdates: false,
      playerEvents: false,
    },
  },
})

export function Settings() {
  const [settings, setSettings] = useState<SettingsData>(getInitialSettings())
  const [originalSettings, setOriginalSettings] = useState<SettingsData>(getInitialSettings())
  const [isLoading, setIsLoading] = useState(false)
  const [notificationId, setNotificationId] = useState<number | null>(null)
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false)

  // Load notification settings when the page mounts
  useEffect(() => {
    const loadNotifications = async () => {
      setIsNotificationsLoading(true)
      try {
        const notifications = await notificationsService.getNotifications()
        if (notifications.length > 0) {
          const primary = notifications[0]
          setNotificationId(primary.id)
          const loadedSettings = {
            notifications: {
              enableNotifications: primary.enabled,
              webhookUrl: primary.URL,
              notificationTypes: {
                serverStartStop: primary.send_server,
                modUpdates: primary.send_mod_update,
                // Player events are not yet supported by the backend; keep local preference
                playerEvents: false,
              },
            },
          }
          setSettings(loadedSettings)
          setOriginalSettings(loadedSettings)
        }
      } catch (error) {
        // Surface error but do not block the rest of the settings UI
        console.error('Failed to load notification settings:', error)
        handleApiError(error, 'Failed to load notification settings')
      } finally {
        setIsNotificationsLoading(false)
      }
    }

    void loadNotifications()
  }, [])

  const handleNotificationUpdate = (notificationSettings: SettingsData['notifications']) => {
    setSettings((prev) => ({
      ...prev,
      notifications: notificationSettings,
    }))
  }

  const buildNotificationPayload = () => {
    const { notifications } = settings
    return {
      URL: notifications.webhookUrl,
      enabled: notifications.enableNotifications,
      send_server: notifications.notificationTypes.serverStartStop,
      send_mod_update: notifications.notificationTypes.modUpdates,
    }
  }

  const saveNotificationSettings = async () => {
    const payload = buildNotificationPayload()

    const shouldPersistNotification =
      payload.URL || payload.enabled || payload.send_server || payload.send_mod_update

    // If there is no meaningful notification configuration, just ensure any existing
    // notification is disabled and return.
    if (!shouldPersistNotification) {
      if (notificationId != null) {
        await notificationsService.updateNotification(notificationId, { enabled: false })
      }
      return
    }

    if (notificationId == null) {
      const response = await notificationsService.createNotification(payload)
      setNotificationId(response.result)
    } else {
      await notificationsService.updateNotification(notificationId, payload)
    }
  }

  const hasSettingsChanged = () => {
    return (
      settings.notifications.enableNotifications !==
        originalSettings.notifications.enableNotifications ||
      settings.notifications.webhookUrl !== originalSettings.notifications.webhookUrl ||
      settings.notifications.notificationTypes.serverStartStop !==
        originalSettings.notifications.notificationTypes.serverStartStop ||
      settings.notifications.notificationTypes.modUpdates !==
        originalSettings.notifications.notificationTypes.modUpdates ||
      settings.notifications.notificationTypes.playerEvents !==
        originalSettings.notifications.notificationTypes.playerEvents
    )
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)

    try {
      await saveNotificationSettings()
      setOriginalSettings(settings)
      toast.success('Notification settings saved successfully!')
    } catch (error) {
      console.error('Failed to save notification settings:', error)
      handleApiError(error, 'Failed to save notification settings')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageTitle title="Settings" description="Configure your ARMA server manager" />
          {isNotificationsLoading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
          )}
        </div>

        <NotificationSettings
          settings={settings.notifications}
          onUpdate={handleNotificationUpdate}
        />

        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading || !hasSettingsChanged()}
            className="flex items-center gap-2"
          >
            <IconDeviceFloppy className="h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}
