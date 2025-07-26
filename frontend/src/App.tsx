import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dashboard } from './components/Dashboard';
import { AppSidebar } from './components/app-sidebar';
import { SidebarProvider, SidebarInset } from './components/ui/sidebar';
import LoginPage from './components/LoginPage';
import { NavigationContext } from './hooks/use-navigation';

const queryClient = new QueryClient();

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContext.Provider value={{ currentPage, setCurrentPage }}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Dashboard />
          </SidebarInset>
        </SidebarProvider>
      </NavigationContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
