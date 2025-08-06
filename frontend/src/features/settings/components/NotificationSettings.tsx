import { IconBell } from '@tabler/icons-react'

import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import type { NotificationSettings as NotificationSettingsType } from '../types'

interface NotificationSettingsProps {
  settings: NotificationSettingsType
  onUpdate: (settings: NotificationSettingsType) => void
}

export function NotificationSettings({
  settings,
  onUpdate,
}: NotificationSettingsProps) {
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
    type: keyof NotificationSettingsType['notificationTypes'],
    value: boolean,
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBell className="h-4 w-4" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Configure webhook notifications for server events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Notifications</Label>
              <div className="text-[0.8rem] text-muted-foreground">
                Send notifications when server events occur
              </div>
            </div>
            <Switch
              checked={settings.enableNotifications}
              onCheckedChange={handleToggleNotifications}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              placeholder="https://hooks.slack.com/services/... or https://discord.com/api/webhooks/..."
              value={settings.webhookUrl}
              onChange={handleWebhookUrlChange}
              disabled={!settings.enableNotifications}
            />
            <div className="text-[0.8rem] text-muted-foreground">
              Supports Discord, Slack, or any webhook-compatible service
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Server Start/Stop</Label>
              <div className="text-[0.8rem] text-muted-foreground">
                Notify when server starts or stops
              </div>
            </div>
            <Switch
              checked={settings.notificationTypes.serverStartStop}
              onCheckedChange={value =>
                handleNotificationTypeToggle('serverStartStop', value)
              }
              disabled={!settings.enableNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Mod Updates</Label>
              <div className="text-[0.8rem] text-muted-foreground">
                Notify when mods are updated
              </div>
            </div>
            <Switch
              checked={settings.notificationTypes.modUpdates}
              onCheckedChange={value =>
                handleNotificationTypeToggle('modUpdates', value)
              }
              disabled={!settings.enableNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Player Events</Label>
              <div className="text-[0.8rem] text-muted-foreground">
                Notify when players join/leave
              </div>
            </div>
            <Switch
              checked={settings.notificationTypes.playerEvents}
              onCheckedChange={value =>
                handleNotificationTypeToggle('playerEvents', value)
              }
              disabled={!settings.enableNotifications}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
