/// <reference types="vitest/globals" />
import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useMods } from '@/hooks/useMods'
import * as modsService from '@/services/mods.service'
import * as errorHandler from '@/lib/error-handler'

// Mock the services
vi.mock('@/services/mods.service')
vi.mock('@/lib/error-handler')

// Mock the toast functions
const mockShowInfoToast = vi.fn()
const mockHandleApiError = vi.fn()

vi.mocked(errorHandler.showInfoToast).mockImplementation(mockShowInfoToast)
vi.mocked(errorHandler.handleApiError).mockImplementation(mockHandleApiError)

// Mock mod data
const mockModSubscriptions = [
  {
    id: 1,
    steamId: 12345,
    filename: '@TestMod',
    name: 'Test Mod',
    modType: 'mod' as const,
    localPath: null,
    isServerMod: false,
    sizeBytes: 1024000,
    size: '1000.000 KB',
    lastUpdated: null,
    steamLastUpdated: '2024-01-01T00:00:00Z',
    shouldUpdate: true,
    imageAvailable: true,
  },
]

// Test wrapper component
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useMods Hook - Download Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock the getModSubscriptions API call
    vi.mocked(modsService.modService.getModSubscriptions).mockResolvedValue(
      mockModSubscriptions.map((mod) => ({
        id: mod.id,
        steam_id: mod.steamId,
        filename: mod.filename,
        name: mod.name,
        mod_type: mod.modType,
        local_path: mod.localPath,
        server_mod: mod.isServerMod,
        size_bytes: mod.sizeBytes,
        last_updated: mod.lastUpdated,
        steam_last_updated: mod.steamLastUpdated,
        should_update: mod.shouldUpdate,
        image_available: mod.imageAvailable,
      }))
    )

    // Mock the downloadMod API call
    vi.mocked(modsService.modService.downloadMod).mockResolvedValue({
      status: 'job-123',
      message: 'Download queued',
    })
  })

  it('calls downloadMod API with correct mod ID', async () => {
    const { result } = renderHook(() => useMods(), {
      wrapper: createWrapper(),
    })

    // Wait for initial data to load
    await waitFor(() => {
      expect(result.current.modSubscriptions).toHaveLength(1)
    })

    // Call downloadMod with steamId
    await result.current.downloadMod(12345)

    // Verify the API was called with the correct mod ID (internal ID, not steamId)
    expect(modsService.modService.downloadMod).toHaveBeenCalledTimes(1)
    expect(modsService.modService.downloadMod).toHaveBeenCalledWith(1) // Test Mod's internal ID
  })

  it('handles download errors and shows error toast', async () => {
    // Mock API to throw an error
    const error = new Error('Download failed')
    vi.mocked(modsService.modService.downloadMod).mockRejectedValue(error)

    const { result } = renderHook(() => useMods(), {
      wrapper: createWrapper(),
    })

    // Wait for initial data to load
    await waitFor(() => {
      expect(result.current.modSubscriptions).toHaveLength(1)
    })

    // Call downloadMod
    await result.current.downloadMod(12345)

    // Wait for error handling
    await waitFor(() => {
      expect(mockHandleApiError).toHaveBeenCalledTimes(1)
    })

    // Verify error was handled
    expect(mockHandleApiError).toHaveBeenCalledWith(error, 'Failed to download mod')
  })
})
