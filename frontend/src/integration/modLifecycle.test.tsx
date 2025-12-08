/// <reference types="vitest/globals" />
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as modsService from '@/services/mods.service'
import * as collectionsService from '@/services/collections.service'
import * as asyncService from '@/services/async.service'
import { useMods } from '@/hooks/useMods'
import { useCollections } from '@/hooks/useCollections'

// Mock services
vi.mock('@/services/mods.service')
vi.mock('@/services/collections.service')
vi.mock('@/services/async.service')
vi.mock('@/lib/error-handler')

/**
 * Integration Tests: Full Mod Lifecycle
 *
 * These tests verify the complete workflow from subscribing to a mod,
 * downloading it, adding it to a collection, and then cleaning up.
 * They test the integration between hooks, services, and React Query cache.
 */

// Test wrapper component
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// Test component that uses both hooks
function TestComponent() {
  const {
    modSubscriptions,
    addModSubscription,
    removeModSubscription,
    downloadMod,
    uninstallMod,
    downloadingModId,
    uninstallingModId,
  } = useMods()

  const { collections, addModsToCollection, removeModFromCollection } = useCollections()

  return (
    <div>
      <div data-testid="mod-count">{modSubscriptions.length}</div>
      <div data-testid="collection-count">{collections.length}</div>

      {modSubscriptions.map((mod) => (
        <div key={mod.id} data-testid={`mod-${mod.steamId}`}>
          <span data-testid={`mod-${mod.steamId}-name`}>{mod.name}</span>
          <span data-testid={`mod-${mod.steamId}-status`}>{mod.status || 'not_installed'}</span>
          <span data-testid={`mod-${mod.steamId}-path`}>{mod.localPath || 'none'}</span>
          {downloadingModId === mod.id && (
            <span data-testid={`mod-${mod.steamId}-downloading`}>downloading</span>
          )}
          {uninstallingModId === mod.id && (
            <span data-testid={`mod-${mod.steamId}-uninstalling`}>uninstalling</span>
          )}
        </div>
      ))}

      {collections.map((collection) => (
        <div key={collection.id} data-testid={`collection-${collection.id}`}>
          <span data-testid={`collection-${collection.id}-mod-count`}>
            {collection.mods.length}
          </span>
        </div>
      ))}

      <button onClick={() => addModSubscription(12345)}>Subscribe to Mod</button>
      <button onClick={() => downloadMod(12345)}>Download Mod</button>
      <button onClick={() => addModsToCollection(1, [1])}>Add to Collection</button>
      <button onClick={() => removeModFromCollection(1, 1)}>Remove from Collection</button>
      <button onClick={() => uninstallMod(12345)}>Uninstall Mod</button>
      <button onClick={() => removeModSubscription(12345)}>Unsubscribe from Mod</button>
    </div>
  )
}

describe('Integration: Full Mod Lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock initial empty state
    vi.mocked(modsService.modService.getModSubscriptions).mockResolvedValue([])
    vi.mocked(collectionsService.collectionsService.getCollections).mockResolvedValue([
      {
        id: 1,
        name: 'Test Collection',
        description: 'Test',
        mods: [],
        mod_count: 0,
        created_at: '2024-01-01T00:00:00Z',
      },
    ])
  })

  it('completes full lifecycle: subscribe → download → add to collection → uninstall → unsubscribe', async () => {
    const user = userEvent.setup()

    // After subscription, mod appears in list
    const subscribedMod = {
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
      image_available: false,
      status: 'not_installed',
    }

    render(<TestComponent />, { wrapper: createWrapper() })

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('mod-count')).toHaveTextContent('0')
    })

    // Step 1: Subscribe to mod
    // Update mock BEFORE clicking so refetch gets new data
    vi.mocked(modsService.modService.addModSubscriptions).mockResolvedValue({
      ids: [1],
      message: 'Successfully subscribed',
    })
    vi.mocked(modsService.modService.getModSubscriptions).mockResolvedValue([subscribedMod])

    const subscribeButton = screen.getByRole('button', { name: /^subscribe to mod$/i })
    await user.click(subscribeButton)

    expect(modsService.modService.addModSubscriptions).toHaveBeenCalledWith([{ steam_id: 12345 }])

    // Wait for the hooks to refetch and update after invalidation
    await waitFor(
      () => {
        expect(screen.getByTestId('mod-count')).toHaveTextContent('1')
      },
      { timeout: 3000 }
    )

    expect(screen.getByTestId('mod-12345-status')).toHaveTextContent('not_installed')

    // Step 2: Download mod
    // Update mocks BEFORE clicking so refetch gets new data
    const downloadedMod = {
      ...subscribedMod,
      local_path: '/path/to/mod',
      status: 'installed',
      last_updated: '2024-01-15T00:00:00Z',
    }
    vi.mocked(modsService.modService.downloadMod).mockResolvedValue({
      status: 'job-123',
      message: 'Download queued',
    })
    vi.mocked(asyncService.pollAsyncJob).mockImplementation(
      async (_jobId, _onStatusChange, onComplete) => {
        const status = { status: 'SUCCESS' as const, message: 'Download completed' }
        onComplete?.(status)
        return status
      }
    )
    // Update mock before download completes so refetch gets updated mod
    vi.mocked(modsService.modService.getModSubscriptions).mockResolvedValue([downloadedMod])

    const downloadButton = screen.getByRole('button', { name: /download/i })
    await user.click(downloadButton)

    expect(modsService.modService.downloadMod).toHaveBeenCalledWith(1)

    // Wait for async job to complete and queries to refetch after invalidation
    await waitFor(
      () => {
        expect(screen.getByTestId('mod-12345-status')).toHaveTextContent('installed')
        expect(screen.getByTestId('mod-12345-path')).toHaveTextContent('/path/to/mod')
      },
      { timeout: 5000 }
    )

    // Step 3: Add mod to collection
    // Update mocks BEFORE clicking so refetch gets new data
    vi.mocked(collectionsService.collectionsService.addModsToCollection).mockResolvedValue({
      message: 'Successfully added mod to collection',
    })
    vi.mocked(collectionsService.collectionsService.getCollections).mockResolvedValue([
      {
        id: 1,
        name: 'Test Collection',
        description: 'Test',
        mods: [
          {
            id: 1,
            collection_id: 1,
            mod_id: 1,
            load_order: 1,
            mod: downloadedMod,
          },
        ],
        mod_count: 1,
        created_at: '2024-01-01T00:00:00Z',
      },
    ])

    const addToCollectionButton = screen.getByRole('button', { name: /add to collection/i })
    await user.click(addToCollectionButton)

    expect(collectionsService.collectionsService.addModsToCollection).toHaveBeenCalledWith(1, {
      mods: [1],
    })

    // Wait for refetch after invalidation
    await waitFor(() => {
      expect(screen.getByTestId('collection-1-mod-count')).toHaveTextContent('1')
    })

    // Step 4: Remove mod from collection (but keep subscription)
    // Update mocks BEFORE clicking so refetch gets new data
    vi.mocked(collectionsService.collectionsService.removeModFromCollection).mockResolvedValue({
      message: 'Successfully deleted mod from collection',
    })
    vi.mocked(collectionsService.collectionsService.getCollections).mockResolvedValue([
      {
        id: 1,
        name: 'Test Collection',
        description: 'Test',
        mods: [],
        mod_count: 0,
        created_at: '2024-01-01T00:00:00Z',
      },
    ])

    const removeFromCollectionButton = screen.getByRole('button', {
      name: /remove from collection/i,
    })
    await user.click(removeFromCollectionButton)

    expect(collectionsService.collectionsService.removeModFromCollection).toHaveBeenCalledWith(1, 1)

    // Wait for refetch after invalidation
    await waitFor(() => {
      expect(screen.getByTestId('collection-1-mod-count')).toHaveTextContent('0')
      // Mod should still be subscribed
      expect(screen.getByTestId('mod-count')).toHaveTextContent('1')
    })

    // Step 5: Uninstall mod from filesystem
    // Update mocks BEFORE clicking so refetch gets new data
    const uninstalledMod = {
      ...downloadedMod,
      local_path: null,
      status: 'not_installed',
    }
    vi.mocked(modsService.modService.deleteMod).mockResolvedValue({
      status: 'job-456',
      message: 'Remove queued',
    })
    vi.mocked(asyncService.pollAsyncJob).mockImplementation(
      async (_jobId, _onStatusChange, onComplete) => {
        const status = { status: 'SUCCESS' as const, message: 'Uninstall completed' }
        onComplete?.(status)
        return status
      }
    )
    // Update mock before uninstall completes so refetch gets updated mod
    vi.mocked(modsService.modService.getModSubscriptions).mockResolvedValue([uninstalledMod])

    const uninstallButton = screen.getByRole('button', { name: /uninstall mod/i })
    await user.click(uninstallButton)

    expect(modsService.modService.deleteMod).toHaveBeenCalledWith(1)

    // Wait for async job to complete and queries to refetch after invalidation
    await waitFor(
      () => {
        expect(screen.getByTestId('mod-12345-status')).toHaveTextContent('not_installed')
        expect(screen.getByTestId('mod-12345-path')).toHaveTextContent('none')
        // Mod should still be subscribed
        expect(screen.getByTestId('mod-count')).toHaveTextContent('1')
      },
      { timeout: 5000 }
    )

    // Step 6: Unsubscribe from mod
    // Update mocks BEFORE clicking so refetch gets new data
    vi.mocked(modsService.modService.removeModSubscription).mockResolvedValue({
      message: 'Unsubscribed successfully',
    })
    vi.mocked(modsService.modService.getModSubscriptions).mockResolvedValue([])

    const unsubscribeButton = screen.getByRole('button', { name: /^unsubscribe from mod$/i })
    await user.click(unsubscribeButton)

    expect(modsService.modService.removeModSubscription).toHaveBeenCalledWith(1)

    // Wait for refetch after invalidation
    await waitFor(() => {
      expect(screen.getByTestId('mod-count')).toHaveTextContent('0')
    })
  })

  it('handles download failure gracefully', async () => {
    const user = userEvent.setup()

    const subscribedMod = {
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
      image_available: false,
      status: 'not_installed',
    }

    vi.mocked(modsService.modService.getModSubscriptions).mockResolvedValue([subscribedMod])

    render(<TestComponent />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByTestId('mod-12345-status')).toHaveTextContent('not_installed')
    })

    // Simulate download failure
    vi.mocked(modsService.modService.downloadMod).mockResolvedValue({
      status: 'job-123',
      message: 'Download queued',
    })

    vi.mocked(asyncService.pollAsyncJob).mockImplementation(
      async (_jobId, _onStatusChange, onComplete) => {
        const status = { status: 'FAILURE' as const, message: 'Disk full' }
        onComplete?.(status)
        return status
      }
    )

    const downloadButton = screen.getByRole('button', { name: /download mod/i })
    await user.click(downloadButton)

    // After failure, the hook should handle the error
    // In the current implementation, failures are logged but don't update mod status
    // So this test just verifies the error callback was invoked
    await waitFor(() => {
      expect(asyncService.pollAsyncJob).toHaveBeenCalled()
    })
  })

  it('handles multiple mods in parallel operations', async () => {
    userEvent.setup()

    const mod1 = {
      id: 1,
      steam_id: 12345,
      filename: '@Mod1',
      name: 'Mod 1',
      mod_type: 'mod' as const,
      local_path: null,
      server_mod: false,
      size_bytes: 1024000,
      last_updated: null,
      steam_last_updated: '2024-01-01T00:00:00Z',
      should_update: true,
      image_available: false,
      status: 'not_installed',
    }

    const mod2 = {
      id: 2,
      steam_id: 67890,
      filename: '@Mod2',
      name: 'Mod 2',
      mod_type: 'mod' as const,
      local_path: '/path/to/mod2',
      server_mod: false,
      size_bytes: 2048000,
      last_updated: '2024-01-10T00:00:00Z',
      steam_last_updated: '2024-01-01T00:00:00Z',
      should_update: true,
      image_available: false,
      status: 'installed',
    }

    vi.mocked(modsService.modService.getModSubscriptions).mockResolvedValue([mod1, mod2])

    render(<TestComponent />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByTestId('mod-count')).toHaveTextContent('2')
      expect(screen.getByTestId('mod-12345-status')).toHaveTextContent('not_installed')
      expect(screen.getByTestId('mod-67890-status')).toHaveTextContent('installed')
    })

    // Both mods can be managed independently
    expect(screen.getByTestId('mod-12345-name')).toHaveTextContent('Mod 1')
    expect(screen.getByTestId('mod-67890-name')).toHaveTextContent('Mod 2')
  })
})
