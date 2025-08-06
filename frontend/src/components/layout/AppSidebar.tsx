import * as React from 'react'
import {
  IconServer,
  IconSettings,
  IconFolder,
  IconPackage,
  IconLogout,
  IconChevronsLeft,
  IconChevronsRight,
  IconCalendarTime,
} from '@tabler/icons-react'

import { NavSection } from '@/components/common/NavSection'
import { useNavigation } from '@/hooks/use-navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

const data = {
  navControl: [
    {
      title: 'Control Panel',
      url: 'server-control',
      icon: IconServer,
    },
    {
      title: 'Schedules',
      url: 'schedules',
      icon: IconCalendarTime,
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
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setCurrentPage } = useNavigation()
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <Sidebar collapsible="icon" {...props}>
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
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleSidebar}
              tooltip={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <IconChevronsRight /> : <IconChevronsLeft />}
              <span>{isCollapsed ? 'Expand' : 'Collapse'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setCurrentPage('settings')}
              tooltip="Settings"
            >
              <IconSettings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                // TODO: Implement logout logic
                console.log('Logout clicked')
              }}
              tooltip="Logout"
            >
              <IconLogout />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
