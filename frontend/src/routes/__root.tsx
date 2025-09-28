import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { NavigationCommandDialog } from '@/components/NavigationCommandDialog'
import { Toaster } from '@/components/ui/sonner'

export const Route = createRootRoute({
  component: () => (
    <div className="relative min-h-screen">
      {/* Arma-style topographic background overlay */}
      <div className="arma-topographic-background" />

      <div className="relative z-10">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <div className="@container/main flex flex-1 flex-col gap-4">
              <div className="flex flex-col gap-6 py-12 md:gap-8 md:py-14">
                <div className="px-6 lg:px-8">
                  <Outlet />
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
        <NavigationCommandDialog />
        <Toaster />
        <TanStackRouterDevtools />
      </div>
    </div>
  ),
})
