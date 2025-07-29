import * as React from 'react';
import { IconServer, IconSettings, IconFolder, IconPackage } from '@tabler/icons-react';

import { NavControl } from '@/components/nav-control';
import { NavContent } from '@/components/nav-content';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
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
  user: {
    name: 'ARMA Admin',
    email: 'admin@armaserver.local',
    avatar: '/avatars/admin.jpg',
  },
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
  navTools: [
    {
      title: 'Settings',
      url: '#',
      icon: IconSettings,
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
                <IconServer className="!size-5" />
                <span className="text-base font-semibold">ARMA Server Manager</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavControl items={data.navControl} />
        <NavContent items={data.navContent} />
        <NavSecondary items={data.navTools} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
