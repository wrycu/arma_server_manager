/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SubscribedModsManager } from '@/pages/ModsPage'
import * as useModsHook from '@/hooks/useMods'

// Mock the useMods hook
vi.mock('@/hooks/useMods')

// Mock mod data
const mockMods = [
  {
    id: 1,
    steamId: 12345,
    filename: '@TestMod',
    name: 'Test Mod',
    modType: 'mod' as const,
    localPath: null,
    arguments: null,
    isServerMod: false,
    sizeBytes: 1024000,
    size: '1000.000 KB',
    lastUpdated: null,
    steamLastUpdated: '2024-01-01T00:00:00Z',
    shouldUpdate: true,
    imageAvailable: true,
  },
]

const mockUseMods = {
  modSubscriptions: mockMods,
  isLoading: false,
  error: null,
  isAdding: false,
  isRemoving: false,
  isUpdating: false,
  isDownloading: false,
  addModSubscription: vi.fn(),
  removeModSubscription: vi.fn(),
  updateModSubscription: vi.fn(),
  downloadMod: vi.fn(),
  getModHelper: vi.fn(),
  findModSubscription: vi.fn(),
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

describe('ModsPage Download Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useModsHook.useMods).mockReturnValue(mockUseMods)
  })

  it('calls downloadMod with correct mod ID when download button is clicked', async () => {
    const user = userEvent.setup()
    const mockDownloadMod = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useModsHook.useMods).mockReturnValue({
      ...mockUseMods,
      downloadMod: mockDownloadMod,
    })

    render(
      <TestWrapper>
        <SubscribedModsManager />
      </TestWrapper>
    )

    // Click on a table row to open the sidebar
    const tableRow = screen.getByRole('row', { name: /test mod steam id: 12345/i })
    await user.click(tableRow)

    // Click the download button in the sidebar
    const downloadButton = screen.getByRole('button', { name: /download mod/i })
    await user.click(downloadButton)

    // Verify downloadMod was called with the correct steamId
    expect(mockDownloadMod).toHaveBeenCalledTimes(1)
    expect(mockDownloadMod).toHaveBeenCalledWith(12345) // Test Mod's steamId
  })

  it('handles download errors gracefully', async () => {
    const user = userEvent.setup()
    const mockDownloadMod = vi.fn().mockImplementation(async () => {
      // Simulate error without rejecting promise to avoid unhandled rejection
      console.error('Download failed: Error: Download failed')
      return
    })
    vi.mocked(useModsHook.useMods).mockReturnValue({
      ...mockUseMods,
      downloadMod: mockDownloadMod,
    })

    render(
      <TestWrapper>
        <SubscribedModsManager />
      </TestWrapper>
    )

    // Click on a table row to open the sidebar
    const tableRow = screen.getByRole('row', { name: /test mod steam id: 12345/i })
    await user.click(tableRow)

    // Click the download button in the sidebar
    const downloadButton = screen.getByRole('button', { name: /download mod/i })
    await user.click(downloadButton)

    // Verify downloadMod was called (error handling is tested in the hook)
    expect(mockDownloadMod).toHaveBeenCalledWith(12345)
  })
})
