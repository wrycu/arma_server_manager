import * as React from 'react'
import {
  IconServer,
  IconSettings,
  IconPuzzle,
  IconChevronsLeft,
  IconChevronsRight,
  IconGift,
  IconSearch,
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
import { useCommandPalette } from '@/contexts/CommandPaletteContext'

const data = {
  arma3: [
    {
      title: 'Control Panel',
      url: 'arma3/control-panel',
      icon: IconServer,
    },
    {
      title: 'Mods',
      url: 'arma3/mods',
      icon: IconPuzzle,
    },
  ],
  armaReforger: [
    {
      title: 'Coming Soon',
      url: '#',
      icon: IconGift,
      disabled: true,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const { setOpen } = useCommandPalette()

  // Detect if user is on Mac
  const isMac =
    typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const commandKey = isMac ? '⌘' : 'Ctrl'

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
      <SidebarContent className="gap-1">
        <NavSection title="ARMA 3" items={data.arma3} />
        <NavSection title="ARMA Reforger" items={data.armaReforger} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleSidebar}
              tooltip={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="text-muted-foreground hover:text-foreground"
            >
              {isCollapsed ? <IconChevronsRight /> : <IconChevronsLeft />}
              <span>{isCollapsed ? 'Expand' : 'Collapse'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setOpen(true)}
              tooltip={{
                children: (
                  <span>Quick search for pages, mods, and collections ({commandKey}+K)</span>
                ),
              }}
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <IconSearch />
              <span>Search</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Settings"
              isActive={currentPath === '/settings'}
              className="text-muted-foreground hover:text-foreground data-[active=true]:text-foreground"
            >
              <Link to="/settings">
                <IconSettings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
