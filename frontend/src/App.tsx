import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Card, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { apiService } from './services/api';

const queryClient = new QueryClient();

function HealthCheck() {
  const { data: healthData } = useQuery({
    queryKey: ['health'],
    queryFn: () => apiService.healthCheck(),
  });

  return (
    <div className="space-y-4">
      {healthData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">API Status</CardTitle>
            <CardDescription>
              {healthData.status ? 'Online' : 'Offline'}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              ARMA Server Manager
            </h1>
            <p className="text-muted-foreground">This is where the frontend will go.</p>
          </div>

          <div className="grid gap-6">
            <div>
              <HealthCheck />
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
