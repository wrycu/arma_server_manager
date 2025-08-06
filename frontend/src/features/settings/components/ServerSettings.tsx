import { IconServer } from '@tabler/icons-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import type { ServerConfiguration } from '../types'

interface ServerSettingsProps {
  settings: ServerConfiguration
  onUpdate: (settings: ServerConfiguration) => void
}

export function ServerSettings({ settings, onUpdate }: ServerSettingsProps) {
  const handleInputChange =
    (field: keyof ServerConfiguration) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        field === 'serverPort' || field === 'maxPlayers'
          ? Number(event.target.value)
          : event.target.value

      onUpdate({
        ...settings,
        [field]: value,
      })
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconServer className="h-4 w-4" />
          Server Configuration
        </CardTitle>
        <CardDescription>Configure server settings and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="server-name">Server Name</Label>
            <Input
              id="server-name"
              placeholder="My ARMA 3 Server"
              value={settings.serverName}
              onChange={handleInputChange('serverName')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="server-port">Server Port</Label>
            <Input
              id="server-port"
              type="number"
              placeholder="2302"
              value={settings.serverPort || ''}
              onChange={handleInputChange('serverPort')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="server-password">Server Password</Label>
          <Input
            id="server-password"
            type="password"
            placeholder="Optional server password"
            value={settings.serverPassword}
            onChange={handleInputChange('serverPassword')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-players">Max Players</Label>
          <Input
            id="max-players"
            type="number"
            min="1"
            max="200"
            placeholder="64"
            value={settings.maxPlayers || ''}
            onChange={handleInputChange('maxPlayers')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="server-description">Server Description</Label>
          <Textarea
            id="server-description"
            placeholder="A brief description of your server"
            value={settings.serverDescription}
            onChange={handleInputChange('serverDescription')}
            className="min-h-[100px]"
          />
        </div>
      </CardContent>
    </Card>
  )
}
