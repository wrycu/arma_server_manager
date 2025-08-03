import { useState } from 'react';
import {
  IconBell,
  IconServer,
  IconShield,
  IconDeviceFloppy,
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTitle } from '@/components/common/PageTitle';

import { NotificationSettings, ServerSettings, SecuritySettings } from './components';
import type { SettingsData, SettingsTab } from './types';

// Mock initial data - in a real app, this would come from an API
const initialSettings: SettingsData = {
  notifications: {
    enableNotifications: true,
    webhookUrl: '',
    notificationTypes: {
      serverStartStop: true,
      modUpdates: false,
      playerEvents: false,
    },
  },
  server: {
    serverName: 'My ARMA 3 Server',
    serverPort: 2302,
    serverPassword: '',
    maxPlayers: 64,
    serverDescription: '',
  },
  security: {
    adminPassword: '',
    enableLogging: true,
  },
};

export function Settings() {
  const [settings, setSettings] = useState<SettingsData>(initialSettings);
  const [activeTab, setActiveTab] = useState<SettingsTab>('notifications');
  const [isLoading, setIsLoading] = useState(false);

  const handleNotificationUpdate = (
    notificationSettings: SettingsData['notifications']
  ) => {
    setSettings((prev) => ({
      ...prev,
      notifications: notificationSettings,
    }));
  };

  const handleServerUpdate = (serverSettings: SettingsData['server']) => {
    setSettings((prev) => ({
      ...prev,
      server: serverSettings,
    }));
  };

  const handleSecurityUpdate = (securitySettings: SettingsData['security']) => {
    setSettings((prev) => ({
      ...prev,
      security: securitySettings,
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would make an API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Settings saved:', settings);
      // You could show a toast notification here
    } catch (error) {
      console.error('Failed to save settings:', error);
      // You could show an error toast here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="bg-background/95 backdrop-blur">
        <PageTitle
          title="Settings"
          description="Configure your server manager preferences"
        />
      </div>

      <div className="flex-1 overflow-auto py-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as SettingsTab)}
        >
          <TabsList className="w-fit mb-6">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <IconBell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="server" className="flex items-center gap-2">
              <IconServer className="h-4 w-4" />
              Server
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <IconShield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications">
            <NotificationSettings
              settings={settings.notifications}
              onUpdate={handleNotificationUpdate}
            />
          </TabsContent>

          <TabsContent value="server">
            <ServerSettings settings={settings.server} onUpdate={handleServerUpdate} />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings
              settings={settings.security}
              onUpdate={handleSecurityUpdate}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-8">
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <IconDeviceFloppy className="h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
