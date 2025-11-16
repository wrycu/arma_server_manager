/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ControlPanelPage } from '@/pages/ControlPanelPage'
import * as useCollectionsHook from '@/hooks/useCollections'
import * as useServerHook from '@/hooks/useServer'
import * as serverServiceModule from '@/services/server.service'
import type { Collection } from '@/types/collections'
import type { ServerConfig } from '@/types/server'

// Mock the hooks
vi.mock('@/hooks/useCollections')
vi.mock('@/hooks/useServer')
vi.mock('@/services/server.service')
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))
vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock data
const mockCollection: Collection = {
  id: 1,
  name: 'Test Collection',
  description: 'A test collection',
  createdAt: '2024-01-01T00:00:00Z',
  mods: [],
  isActive: true,
}

const mockServer: ServerConfig = {
  id: 1,
  name: 'Test Server',
  description: 'A test server',
  server_name: 'Test Server',
  max_players: 32,
  is_active: false,
  mission_file: 'test.mission',
  server_config_file: 'server.cfg',
  basic_config_file: 'basic.cfg',
  server_mods: null,
  client_mods: null,
  additional_params: null,
  server_binary: 'arma3server',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  collection_id: null,
  collection: null,
  use_headless_client: false,
  headless_client_active: false,
  resources: {
    cpu_usage_percent: 0,
    ram_usage_percent: 0,
    uptime_in_seconds: 0,
  },
}

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('ControlPanelPage Start Button', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock useCollections hook
    vi.mocked(useCollectionsHook.useCollections).mockReturnValue({
      collections: [mockCollection],
      isLoading: false,
      error: null,
      createCollection: vi.fn(),
      deleteCollection: vi.fn(),
      toggleMod: vi.fn(),
      removeModFromCollection: vi.fn(),
      addModsToCollection: vi.fn(),
      setActive: vi.fn(),
      updateCollectionName: vi.fn(),
    })

    // Mock useServer hook
    vi.mocked(useServerHook.useServer).mockReturnValue({
      servers: [mockServer],
      selectedServer: mockServer,
      isServersLoading: false,
      serversError: null,
      isSelectedServerLoading: false,
      selectedServerError: null,
      invalidateServers: vi.fn(),
      invalidateServer: vi.fn(),
      refetchServers: vi.fn(),
      server: null,
      metricsHistory: [],
      isLoading: false,
    })
  })

  it('calls serverService.performServerAction with "start" action when start button is clicked', async () => {
    const user = userEvent.setup()
    const mockPerformServerAction = vi
      .fn()
      .mockResolvedValue({ message: 'Server started successfully' })
    vi.mocked(serverServiceModule.serverService.performServerAction).mockImplementation(
      mockPerformServerAction
    )

    render(
      <TestWrapper>
        <ControlPanelPage />
      </TestWrapper>
    )

    // Find and click the start button (not restart)
    const startButton = screen.getByRole('button', { name: 'Start' })
    await user.click(startButton)

    // Verify that performServerAction was called with the correct parameters
    expect(mockPerformServerAction).toHaveBeenCalledTimes(1)
    expect(mockPerformServerAction).toHaveBeenCalledWith('start', mockCollection.id)
  })
})
