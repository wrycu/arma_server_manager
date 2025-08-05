import {
  IconServer,
  IconSettings,
  IconFolder,
  IconPackage,
  IconLogout,
  IconCalendarTime,
} from '@tabler/icons-react';

import { useNavigation } from '@/hooks/use-navigation';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';

const navigationData = {
  serverManagement: [
    {
      title: 'Control Panel',
      url: 'server-control',
      icon: IconServer,
      shortcut: '⌘C',
    },
    {
      title: 'Schedules',
      url: 'schedules',
      icon: IconCalendarTime,
      shortcut: '⌘H',
    },
  ],
  contentLibrary: [
    {
      title: 'Collections',
      url: 'collections',
      icon: IconFolder,
      shortcut: '⌘O',
    },
    {
      title: 'Installed',
      url: 'mod-management',
      icon: IconPackage,
      shortcut: '⌘M',
    },
  ],
  other: [
    {
      title: 'Settings',
      url: 'settings',
      icon: IconSettings,
      shortcut: '⌘S',
    },
    {
      title: 'Logout',
      url: 'logout',
      icon: IconLogout,
      shortcut: '⌘L',
      action: 'logout',
    },
  ],
};

interface NavigationCommandProps {
  className?: string;
  onNavigate?: () => void;
}

export function NavigationCommand({ className, onNavigate }: NavigationCommandProps) {
  const { setCurrentPage } = useNavigation();

  const handleItemSelect = (item: { action?: string; url: string }) => {
    if (item.action === 'logout') {
      // TODO: Implement logout logic
      console.log('Logout clicked');
    } else {
      setCurrentPage(item.url);
    }
    onNavigate?.();
  };

  return (
    <Command className={className}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Server Management">
          {navigationData.serverManagement.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.url}
                onSelect={() => handleItemSelect(item)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
                {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Content Library">
          {navigationData.contentLibrary.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.url}
                onSelect={() => handleItemSelect(item)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
                {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Other">
          {navigationData.other.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.url}
                onSelect={() => handleItemSelect(item)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
                {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
