import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MainContent } from '@/components/MainContent'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { LoginPage } from '@/pages/AuthPage'
import { NavigationContext } from '@/hooks/useNavigation'
import { NavigationCommandDialog } from '@/components/NavigationCommandDialog'
import { AppSidebar } from '@/components/AppSidebar'

const queryClient = new QueryClient()

function App() {
  const [currentPage, setCurrentPage] = useState('server-control')
  const [isLoggedIn, setIsLoggedIn] = useState(true) // Temporarily set to true for development

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContext.Provider value={{ currentPage, setCurrentPage }}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <MainContent />
          </SidebarInset>
        </SidebarProvider>
        <NavigationCommandDialog />
      </NavigationContext.Provider>
    </QueryClientProvider>
  )
}

export default App
