import * as React from 'react';
import { IconServer, IconSettings, IconFolder, IconPackage } from '@tabler/icons-react';

import { NavSection } from '@/components/common';
import { LogoutButton } from './LogoutButton';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const data = {
  navControl: [
    {
      title: 'Control Panel',
      url: 'server-control',
      icon: IconServer,
    },
  ],
  navContent: [
    {
      title: 'Collections',
      url: 'collections',
      icon: IconFolder,
    },
    {
      title: 'Installed',
      url: 'mod-management',
      icon: IconPackage,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <img src="/tuna.png" alt="ARMA 3 Server Manager" className="size-4" />
                <span className="text-base font-semibold">ARMA Server Manager</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavSection title="Server Management" items={data.navControl} />
        <NavSection title="Content Library" items={data.navContent} />
        <NavSection
          title="Settings"
          items={[{ title: 'Settings', url: '#', icon: IconSettings }]}
          enableNavigation={false}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
