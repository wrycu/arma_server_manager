import * as React from "react"
import { type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useNavigation } from "@/hooks/use-navigation"

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
  }[]
  enableNavigation?: boolean
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { currentPage, setCurrentPage } = useNavigation()

  return (
    <SidebarGroup {...props}>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={enableNavigation ? currentPage === item.url : false}
                onClick={enableNavigation ? () => setCurrentPage(item.url) : undefined}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
