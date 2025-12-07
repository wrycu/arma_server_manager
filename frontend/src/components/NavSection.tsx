import * as React from 'react'
import { type Icon } from '@tabler/icons-react'
import { Link, useRouterState } from '@tanstack/react-router'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function NavSection({
  title,
  items,
  enableNavigation = true,
  ...props
}: {
  title: string
  items: {
    title: string
    url: string
    icon?: Icon
    disabled?: boolean
  }[]
  enableNavigation?: boolean
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <SidebarGroup className="py-1" {...props}>
      <SidebarGroupLabel className="mb-0.5">{title}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map((item) => {
            const isActive = enableNavigation && !item.disabled && currentPath === `/${item.url}`
            const isDisabled = item.disabled || false

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  disabled={isDisabled}
                  className={isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                >
                  <Link to={enableNavigation && !isDisabled ? `/${item.url}` : '#'}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
