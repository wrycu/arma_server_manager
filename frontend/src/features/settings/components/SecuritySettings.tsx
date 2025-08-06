import { IconShield } from '@tabler/icons-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import type { SecuritySettings as SecuritySettingsType } from '../types'

interface SecuritySettingsProps {
  settings: SecuritySettingsType
  onUpdate: (settings: SecuritySettingsType) => void
}

export function SecuritySettings({ settings, onUpdate }: SecuritySettingsProps) {
  const handleInputChange =
    (field: keyof SecuritySettingsType) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...settings,
        [field]: event.target.value,
      })
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconShield className="h-4 w-4" />
          Security Settings
        </CardTitle>
        <CardDescription>Configure access control and security options</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-password">Admin Password</Label>
          <Input
            id="admin-password"
            type="password"
            placeholder="Enter admin password"
            value={settings.adminPassword}
            onChange={handleInputChange('adminPassword')}
          />
        </div>
      </CardContent>
    </Card>
  )
}
