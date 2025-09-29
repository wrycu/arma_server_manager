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
import { Link, useRouterState } from '@tanstack/react-router'

import { NavSection } from '@/components/NavSection'
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
      url: 'control-panel',
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
      title: 'Subscriptions',
      url: 'mod-subscriptions',
      icon: IconPackage,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to="/">
                <img src="/tuna.png" alt="ARMA 3 Server Manager" className="size-4" />
                <span className="text-base font-semibold">ARMA Server Manager</span>
              </Link>
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
            <SidebarMenuButton asChild tooltip="Settings" isActive={currentPath === '/settings'}>
              <Link to="/settings">
                <IconSettings />
                <span>Settings</span>
              </Link>
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
