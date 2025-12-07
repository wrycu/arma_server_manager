import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { NotificationSettings } from '@/types/settings'

interface NotificationSettingsProps {
  settings: NotificationSettings
  onUpdate: (settings: NotificationSettings) => void
}

export function NotificationSettings({ settings, onUpdate }: NotificationSettingsProps) {
  const handleToggleNotifications = (enableNotifications: boolean) => {
    onUpdate({
      ...settings,
      enableNotifications,
    })
  }

  const handleWebhookUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...settings,
      webhookUrl: event.target.value,
    })
  }

  const handleNotificationTypeToggle = (
    type: keyof NotificationSettings['notificationTypes'],
    value: boolean
  ) => {
    onUpdate({
      ...settings,
      notificationTypes: {
        ...settings.notificationTypes,
        [type]: value,
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Receive webhook notifications for server events</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Toggle */}
        <div className="flex items-center gap-3">
          <Checkbox
            id="enable-notifications"
            checked={settings.enableNotifications}
            onCheckedChange={handleToggleNotifications}
          />
          <div className="flex-1">
            <Label htmlFor="enable-notifications" className="text-sm font-medium cursor-pointer">
              Enable Notifications
            </Label>
          </div>
        </div>

        {/* Event Types Section */}
        <div className={`space-y-4 ${!settings.enableNotifications ? 'opacity-50' : ''}`}>
          <div>
            <h4 className="text-sm font-medium mb-3">Event Types</h4>
            <div className="space-y-3 pl-1">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="server-startstop"
                  checked={settings.notificationTypes.serverStartStop}
                  onCheckedChange={(value) =>
                    handleNotificationTypeToggle('serverStartStop', value as boolean)
                  }
                  disabled={!settings.enableNotifications}
                />
                <Label
                  htmlFor="server-startstop"
                  className={`font-normal ${settings.enableNotifications ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  Server Start/Stop
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="mod-updates"
                  checked={settings.notificationTypes.modUpdates}
                  onCheckedChange={(value) =>
                    handleNotificationTypeToggle('modUpdates', value as boolean)
                  }
                  disabled={!settings.enableNotifications}
                />
                <Label
                  htmlFor="mod-updates"
                  className={`font-normal ${settings.enableNotifications ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  Mod Updates
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="player-events"
                  checked={settings.notificationTypes.playerEvents}
                  onCheckedChange={(value) =>
                    handleNotificationTypeToggle('playerEvents', value as boolean)
                  }
                  disabled={!settings.enableNotifications}
                />
                <Label
                  htmlFor="player-events"
                  className={`font-normal ${settings.enableNotifications ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  Player Events
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Webhook Configuration Section */}
        <div className={`space-y-2 ${!settings.enableNotifications ? 'opacity-50' : ''}`}>
          <Label htmlFor="webhook-url">Webhook URL</Label>
          <Input
            id="webhook-url"
            placeholder="https://discord.com/api/webhooks/..."
            value={settings.webhookUrl}
            onChange={handleWebhookUrlChange}
            disabled={!settings.enableNotifications}
          />
        </div>
      </CardContent>
    </Card>
  )
}
