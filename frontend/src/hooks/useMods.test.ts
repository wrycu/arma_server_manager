/// <reference types="vitest/globals" />
import React from 'react'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useMods } from '@/hooks/useMods'
import * as modsService from '@/services/mods.service'
import * as asyncService from '@/services/async.service'
import * as errorHandler from '@/lib/error-handler'

// Mock the services
vi.mock('@/services/mods.service')
vi.mock('@/services/async.service')
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
    steam_id: 12345,
    filename: '@TestMod',
    name: 'Test Mod',
    mod_type: 'mod' as const,
    local_path: null,
    server_mod: false,
    size_bytes: 1024000,
    last_updated: null,
    steam_last_updated: '2024-01-01T00:00:00Z',
    should_update: true,
    image_available: true,
  },
  {
    id: 2,
    steam_id: 67890,
    filename: '@InstalledMod',
    name: 'Installed Mod',
    mod_type: 'mod' as const,
    local_path: '/path/to/mod',
    server_mod: false,
    size_bytes: 2048000,
    last_updated: '2024-01-15T00:00:00Z',
    steam_last_updated: '2024-01-01T00:00:00Z',
    should_update: true,
    image_available: true,
    status: 'installed',
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

describe('useMods Hook - Subscription Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock the getModSubscriptions API call
    vi.mocked(modsService.modService.getModSubscriptions).mockResolvedValue(mockModSubscriptions)
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('loads mod subscriptions on mount', async () => {
    const { result } = renderHook(() => useMods(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.modSubscriptions).toHaveLength(2)
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.modSubscriptions[0].name).toBe('Test Mod')
    expect(result.current.modSubscriptions[1].name).toBe('Installed Mod')
  })

  it('adds mod subscription successfully', async () => {
    vi.mocked(modsService.modService.addModSubscriptions).mockResolvedValue({
      ids: [3],
      message: 'Successfully subscribed',
    })

    const { result } = renderHook(() => useMods(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.modSubscriptions).toHaveLength(2)
    })

    await act(async () => {
      await result.current.addModSubscription(99999)
    })

    expect(modsService.modService.addModSubscriptions).toHaveBeenCalledWith([{ steam_id: 99999 }])
  })

  it('handles add subscription error', async () => {
    const error = new Error('Mod already subscribed')
    vi.mocked(modsService.modService.addModSubscriptions).mockRejectedValue(error)

    const { result } = renderHook(() => useMods(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.modSubscriptions).toHaveLength(2)
    })

    await act(async () => {
      await result.current.addModSubscription(12345)
    })

    await waitFor(() => {
      expect(mockHandleApiError).toHaveBeenCalledWith(error, 'Failed to add mod subscription')
    })
  })

  it('removes mod subscription successfully', async () => {
    vi.mocked(modsService.modService.removeModSubscription).mockResolvedValue({
      message: 'Unsubscribed successfully',
    })

    const { result } = renderHook(() => useMods(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.modSubscriptions).toHaveLength(2)
    })

    await act(async () => {
      await result.current.removeModSubscription(12345)
    })

    expect(modsService.modService.removeModSubscription).toHaveBeenCalledWith(1) // Internal ID
  })

  it('handles remove subscription when mod not found', async () => {
    const { result } = renderHook(() => useMods(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.modSubscriptions).toHaveLength(2)
    })

    await act(async () => {
      await result.current.removeModSubscription(99999) // Non-existent steamId
    })

    // Should not call API if mod not found
    expect(modsService.modService.removeModSubscription).not.toHaveBeenCalled()
  })

  it('updates mod subscription details', async () => {
    vi.mocked(modsService.modService.updateModSubscription).mockResolvedValue({
      message: 'Updated successfully',
    })

    const { result } = renderHook(() => useMods(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.modSubscriptions).toHaveLength(2)
    })

    await act(async () => {
      await result.current.updateModSubscription(12345, {
        name: 'Updated Mod Name',
        shouldUpdate: false,
      })
    })

    expect(modsService.modService.updateModSubscription).toHaveBeenCalledWith(1, {
      name: 'Updated Mod Name',
      filename: undefined,
      mod_type: undefined,
      local_path: undefined,
      server_mod: undefined,
      should_update: false,
    })
  })
})

describe('useMods Hook - Download Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock the getModSubscriptions API call
    vi.mocked(modsService.modService.getModSubscriptions).mockResolvedValue(mockModSubscriptions)

    // Mock the downloadMod API call
    vi.mocked(modsService.modService.downloadMod).mockResolvedValue({
      status: 'job-123',
      message: 'Download queued',
    })
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('calls downloadMod API with correct mod ID', async () => {
    // Mock pollAsyncJob to immediately return success
    vi.mocked(asyncService.pollAsyncJob).mockImplementation(
      async (_jobId, _onStatusChange, onComplete) => {
        const status = { status: 'SUCCESS' as const, message: 'Download completed' }
        onComplete?.(status)
        return status
      }
    )

    const { result } = renderHook(() => useMods(), {
      wrapper: createWrapper(),
    })

    // Wait for initial data to load
    await waitFor(() => {
      expect(result.current.modSubscriptions).toHaveLength(2)
    })

    // Call downloadMod with steamId
    await act(async () => {
      await result.current.downloadMod(12345)
    })

    // Verify the API was called with the correct mod ID (internal ID, not steamId)
    expect(modsService.modService.downloadMod).toHaveBeenCalledTimes(1)
    expect(modsService.modService.downloadMod).toHaveBeenCalledWith(1) // Test Mod's internal ID
  })

  it('polls async job status after initiating download', async () => {
    vi.mocked(asyncService.pollAsyncJob).mockImplementation(
      async (_jobId, onStatusChange, onComplete) => {
        // Simulate status transitions
        onStatusChange?.({ status: 'PENDING', message: 'Job queued' })
        onStatusChange?.({ status: 'RUNNING', message: 'Downloading...' })
        const finalStatus = { status: 'SUCCESS' as const, message: 'Download completed' }
        onComplete?.(finalStatus)
        return finalStatus
      }
    )

    const { result } = renderHook(() => useMods(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.modSubscriptions).toHaveLength(2)
    })

    await act(async () => {
      await result.current.downloadMod(12345)
    })

    expect(asyncService.pollAsyncJob).toHaveBeenCalledWith(
      'job-123',
      undefined,
      expect.any(Function)
    )
  })

  it('updates UI without reload after successful download', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return React.createElement(QueryClientProvider, { client: queryClient }, children)
    }

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    vi.mocked(asyncService.pollAsyncJob).mockImplementation(
      async (_jobId, _onStatusChange, onComplete) => {
        const status = { status: 'SUCCESS' as const, message: 'Download completed' }
        onComplete?.(status)
        return status
      }
    )

    const { result } = renderHook(() => useMods(), { wrapper })

    await waitFor(() => {
      expect(result.current.modSubscriptions).toHaveLength(2)
    })

    await act(async () => {
      await result.current.downloadMod(12345)
    })

    // Verify cache was invalidated to trigger refetch
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['mods'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['collections'] })
    })
  })

  it('handles download errors and shows error message', async () => {
    const error = new Error('Download failed')
    vi.mocked(modsService.modService.downloadMod).mockRejectedValue(error)

    const { result } = renderHook(() => useMods(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.modSubscriptions).toHaveLength(2)
    })

    await act(async () => {
      await result.current.downloadMod(12345)
    })

    await waitFor(() => {
      expect(mockHandleApiError).toHaveBeenCalledWith(error, 'Download failed')
    })
  })

  it('handles polling failure status', async () => {
    vi.mocked(asyncService.pollAsyncJob).mockImplementation(
      async (_jobId, _onStatusChange, onComplete) => {
        const status = { status: 'FAILURE' as const, message: 'Disk full' }
        onComplete?.(status)
        return status
      }
    )

    const { result } = renderHook(() => useMods(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.modSubscriptions).toHaveLength(2)
    })

    await act(async () => {
      await result.current.downloadMod(12345)
    })

    await waitFor(() => {
      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'Download failed: Disk full'
      )
    })
  })

  it('sets downloadingModId during download', async () => {
    let resolveDownload: ((value: { status: string; message: string }) => void) | undefined

    vi.mocked(modsService.modService.downloadMod).mockReturnValue(
      new Promise((resolve) => {
        resolveDownload = resolve
      })
    )

    const { result } = renderHook(() => useMods(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.modSubscriptions).toHaveLength(2)
    })

    act(() => {
      result.current.downloadMod(12345)
    })

    await waitFor(() => {
      expect(result.current.downloadingModId).toBe(1)
    })

    // Resolve the download
    await act(async () => {
      resolveDownload?.({ status: 'job-123', message: 'Download queued' })
    })
  })
})

describe('useMods Hook - Deletion Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(modsService.modService.getModSubscriptions).mockResolvedValue(mockModSubscriptions)

    vi.mocked(modsService.modService.deleteMod).mockResolvedValue({
      status: 'job-456',
      message: 'Remove queued',
    })
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('calls deleteMod API with correct mod ID', async () => {
    vi.mocked(asyncService.pollAsyncJob).mockImplementation(
      async (_jobId, _onStatusChange, onComplete) => {
        const status = { status: 'SUCCESS' as const, message: 'Uninstall completed' }
        onComplete?.(status)
        return status
      }
    )

    const { result } = renderHook(() => useMods(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.modSubscriptions).toHaveLength(2)
    })

    await act(async () => {
      await result.current.uninstallMod(67890) // Installed mod
    })

    expect(modsService.modService.deleteMod).toHaveBeenCalledWith(2) // Internal ID
  })

  it('polls async job status after initiating deletion', async () => {
    vi.mocked(asyncService.pollAsyncJob).mockImplementation(
      async (jobId, onStatusChange, onComplete) => {
        onStatusChange?.({ status: 'PENDING', message: 'Job queued' })
        onStatusChange?.({ status: 'RUNNING', message: 'Removing files...' })
        const finalStatus = { status: 'SUCCESS' as const, message: 'Uninstall completed' }
        onComplete?.(finalStatus)
        return finalStatus
      }
    )

    const { result } = renderHook(() => useMods(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.modSubscriptions).toHaveLength(2)
    })

    await act(async () => {
      await result.current.uninstallMod(67890)
    })

    expect(asyncService.pollAsyncJob).toHaveBeenCalledWith(
      'job-456',
      undefined,
      expect.any(Function)
    )
  })

  it('clears local_path after successful deletion', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return React.createElement(QueryClientProvider, { client: queryClient }, children)
    }

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    vi.mocked(asyncService.pollAsyncJob).mockImplementation(
      async (_jobId, _onStatusChange, onComplete) => {
        const status = { status: 'SUCCESS' as const, message: 'Uninstall completed' }
        onComplete?.(status)
        return status
      }
    )

    const { result } = renderHook(() => useMods(), { wrapper })

    await waitFor(() => {
      expect(result.current.modSubscriptions).toHaveLength(2)
    })

    await act(async () => {
      await result.current.uninstallMod(67890)
    })

    // Verify cache was invalidated to reflect cleared local_path
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['mods'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['collections'] })
    })
  })

  it('handles deletion errors', async () => {
    const error = new Error('Permission denied')
    vi.mocked(modsService.modService.deleteMod).mockRejectedValue(error)

    const { result } = renderHook(() => useMods(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.modSubscriptions).toHaveLength(2)
    })

    await act(async () => {
      await result.current.uninstallMod(67890)
    })

    await waitFor(() => {
      expect(mockHandleApiError).toHaveBeenCalledWith(error, 'Uninstall failed')
    })
  })

  it('sets uninstallingModId during deletion', async () => {
    let resolveDelete: ((value: { status: string; message: string }) => void) | undefined

    vi.mocked(modsService.modService.deleteMod).mockReturnValue(
      new Promise((resolve) => {
        resolveDelete = resolve
      })
    )

    const { result } = renderHook(() => useMods(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.modSubscriptions).toHaveLength(2)
    })

    act(() => {
      result.current.uninstallMod(67890)
    })

    await waitFor(() => {
      expect(result.current.uninstallingModId).toBe(2)
    })

    await act(async () => {
      resolveDelete?.({ status: 'job-456', message: 'Remove queued' })
    })
  })
})
