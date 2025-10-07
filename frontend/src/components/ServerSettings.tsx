import { useState } from 'react'
import { IconServer, IconEye, IconEyeOff } from '@tabler/icons-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import type { ServerConfiguration } from '@/types/settings'

interface ServerSettingsProps {
  settings: ServerConfiguration
  onUpdate: (settings: ServerConfiguration) => void
}

export function ServerSettings({ settings, onUpdate }: ServerSettingsProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const handleInputChange =
    (field: keyof ServerConfiguration) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = field === 'max_players' ? Number(event.target.value) : event.target.value

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
      <CardContent className="space-y-6">
        {/* Basic Server Info */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="config-name">Configuration Name *</Label>
              <Input
                id="config-name"
                placeholder="My Server Config"
                value={settings.name}
                onChange={handleInputChange('name')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="server-name">In-Game Server Name *</Label>
              <Input
                id="server-name"
                placeholder="My ARMA 3 Server"
                value={settings.server_name}
                onChange={handleInputChange('server_name')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-players">Max Players</Label>
              <Input
                id="max-players"
                type="number"
                min="1"
                max="200"
                placeholder="32"
                value={settings.max_players || ''}
                onChange={handleInputChange('max_players')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="server-binary">Server Binary Path</Label>
              <Input
                id="server-binary"
                placeholder="/path/to/arma3server"
                value={settings.server_binary}
                onChange={handleInputChange('server_binary')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="A brief description of your server configuration"
              value={settings.description}
              onChange={handleInputChange('description')}
              className="min-h-[80px]"
            />
          </div>
        </div>

        {/* Authentication */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Authentication</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Server Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Optional server password"
                  value={settings.password}
                  onChange={handleInputChange('password')}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <IconEyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <IconEye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Admin Password *</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showAdminPassword ? 'text' : 'password'}
                  placeholder="Required admin password"
                  value={settings.admin_password}
                  onChange={handleInputChange('admin_password')}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  tabIndex={-1}
                >
                  {showAdminPassword ? (
                    <IconEyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <IconEye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* File Paths */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Configuration Files</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mission-file">Mission File</Label>
              <Input
                id="mission-file"
                placeholder="/path/to/mission.pbo"
                value={settings.mission_file}
                onChange={handleInputChange('mission_file')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="server-config-file">Server Config File</Label>
              <Input
                id="server-config-file"
                placeholder="/path/to/server.cfg"
                value={settings.server_config_file}
                onChange={handleInputChange('server_config_file')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="basic-config-file">Basic Config File</Label>
              <Input
                id="basic-config-file"
                placeholder="/path/to/basic.cfg"
                value={settings.basic_config_file}
                onChange={handleInputChange('basic_config_file')}
              />
            </div>
          </div>
        </div>

        {/* Additional Parameters */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Advanced</h4>
          <div className="space-y-2">
            <Label htmlFor="additional-params">Additional Parameters</Label>
            <Textarea
              id="additional-params"
              placeholder="Additional command line parameters"
              value={settings.additional_params}
              onChange={handleInputChange('additional_params')}
              className="min-h-[60px]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
