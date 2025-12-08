/// <reference types="vitest/globals" />
import React from 'react'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useCollections } from '@/hooks/useCollections'
import * as collectionsService from '@/services/collections.service'
import * as errorHandler from '@/lib/error-handler'
import type { CollectionResponse } from '@/types/api'

// Mock the services
vi.mock('@/services/collections.service')
vi.mock('@/lib/error-handler')

// Mock error handler
const mockHandleApiError = vi.fn()
vi.mocked(errorHandler.handleApiError).mockImplementation(mockHandleApiError)

// Mock collection data
const mockCollections: CollectionResponse[] = [
  {
    id: 1,
    name: 'Test Collection',
    description: 'A test collection',
    mods: [
      {
        id: 1,
        collection_id: 1,
        mod_id: 1,
        load_order: 1,
        mod: {
          id: 1,
          steam_id: 12345,
          filename: '@TestMod',
          name: 'Test Mod',
          mod_type: 'mod',
          local_path: '/path/to/mod',
          server_mod: false,
          size_bytes: 1024000,
          last_updated: '2024-01-15T00:00:00Z',
          steam_last_updated: '2024-01-01T00:00:00Z',
          should_update: true,
          image_available: true,
        },
      },
    ],
    mod_count: 1,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Empty Collection',
    description: 'An empty collection',
    mods: [],
    mod_count: 0,
    created_at: '2024-01-02T00:00:00Z',
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

describe('useCollections Hook - Collection Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock the getCollections API call
    vi.mocked(collectionsService.collectionsService.getCollections).mockResolvedValue(
      mockCollections
    )
  })

  it('loads collections on mount', async () => {
    const { result } = renderHook(() => useCollections(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.collections).toHaveLength(2)
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.collections[0].name).toBe('Test Collection')
    expect(result.current.collections[0].mods).toHaveLength(1)
    expect(result.current.collections[1].name).toBe('Empty Collection')
  })

  it('creates new collection successfully', async () => {
    vi.mocked(collectionsService.collectionsService.createCollection).mockResolvedValue({
      result: 3,
      message: 'Created collection successfully',
    })

    const { result } = renderHook(() => useCollections(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.collections).toHaveLength(2)
    })

    await act(async () => {
      await result.current.createCollection({
        name: 'New Collection',
        description: 'A brand new collection',
      })
    })

    expect(collectionsService.collectionsService.createCollection).toHaveBeenCalledWith({
      name: 'New Collection',
      description: 'A brand new collection',
    })
  })

  it('handles create collection error', async () => {
    const error = new Error('Collection name already exists')
    vi.mocked(collectionsService.collectionsService.createCollection).mockRejectedValue(error)

    const { result } = renderHook(() => useCollections(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.collections).toHaveLength(2)
    })

    const newCollection = await act(async () => {
      return await result.current.createCollection({
        name: 'Test Collection',
        description: 'Duplicate name',
      })
    })

    expect(newCollection).toBeUndefined()
    await waitFor(() => {
      expect(mockHandleApiError).toHaveBeenCalledWith(error, 'Failed to create collection')
    })
  })

  it('deletes collection successfully', async () => {
    vi.mocked(collectionsService.collectionsService.deleteCollection).mockResolvedValue({
      message: 'Successfully deleted collection',
    })

    const { result } = renderHook(() => useCollections(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.collections).toHaveLength(2)
    })

    await act(async () => {
      await result.current.deleteCollection(2)
    })

    expect(collectionsService.collectionsService.deleteCollection).toHaveBeenCalledWith(2)
  })

  it('updates collection name successfully', async () => {
    vi.mocked(collectionsService.collectionsService.updateCollection).mockResolvedValue({
      message: 'Successfully updated collection',
    })

    const { result } = renderHook(() => useCollections(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.collections).toHaveLength(2)
    })

    await act(async () => {
      await result.current.updateCollectionName(1, 'Updated Collection Name')
    })

    expect(collectionsService.collectionsService.updateCollection).toHaveBeenCalledWith(1, {
      name: 'Updated Collection Name',
    })
  })

  it('does not update collection with empty name', async () => {
    const { result } = renderHook(() => useCollections(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.collections).toHaveLength(2)
    })

    await act(async () => {
      await result.current.updateCollectionName(1, '   ')
    })

    // Should not call API with trimmed empty string
    expect(collectionsService.collectionsService.updateCollection).not.toHaveBeenCalled()
  })

  it('updates collection with name and description', async () => {
    vi.mocked(collectionsService.collectionsService.updateCollection).mockResolvedValue({
      message: 'Successfully updated collection',
    })

    const { result } = renderHook(() => useCollections(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.collections).toHaveLength(2)
    })

    await act(async () => {
      await result.current.updateCollection(1, {
        name: 'Updated Name',
        description: 'Updated Description',
      })
    })

    expect(collectionsService.collectionsService.updateCollection).toHaveBeenCalledWith(1, {
      name: 'Updated Name',
      description: 'Updated Description',
    })
  })
})

describe('useCollections Hook - Mod Management in Collections', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(collectionsService.collectionsService.getCollections).mockResolvedValue(
      mockCollections
    )
  })

  it('adds mods to collection successfully', async () => {
    vi.mocked(collectionsService.collectionsService.addModsToCollection).mockResolvedValue({
      message: 'Successfully added mod to collection',
    })

    const { result } = renderHook(() => useCollections(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.collections).toHaveLength(2)
    })

    await act(async () => {
      await result.current.addModsToCollection(2, [2, 3]) // Add mods 2 and 3 to empty collection
    })

    expect(collectionsService.collectionsService.addModsToCollection).toHaveBeenCalledWith(2, {
      mods: [2, 3],
    })
  })

  it('handles add mods error', async () => {
    const error = new Error('Mod not found')
    vi.mocked(collectionsService.collectionsService.addModsToCollection).mockRejectedValue(error)

    const { result } = renderHook(() => useCollections(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.collections).toHaveLength(2)
    })

    await act(async () => {
      await result.current.addModsToCollection(1, [999])
    })

    await waitFor(() => {
      expect(mockHandleApiError).toHaveBeenCalledWith(error, 'Failed to add mods to collection')
    })
  })

  it('removes mod from collection successfully', async () => {
    vi.mocked(collectionsService.collectionsService.removeModFromCollection).mockResolvedValue({
      message: 'Successfully deleted mod from collection',
    })

    const { result } = renderHook(() => useCollections(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.collections).toHaveLength(2)
    })

    await act(async () => {
      await result.current.removeModFromCollection(1, 1) // Remove mod 1 from collection 1
    })

    expect(collectionsService.collectionsService.removeModFromCollection).toHaveBeenCalledWith(1, 1)
  })

  it('handles remove mod error', async () => {
    const error = new Error('Mod not in collection')
    vi.mocked(collectionsService.collectionsService.removeModFromCollection).mockRejectedValue(
      error
    )

    const { result } = renderHook(() => useCollections(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.collections).toHaveLength(2)
    })

    await act(async () => {
      await result.current.removeModFromCollection(1, 999)
    })

    await waitFor(() => {
      expect(mockHandleApiError).toHaveBeenCalledWith(error, 'Failed to remove mod from collection')
    })
  })

  it('invalidates cache after adding mods', async () => {
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

    vi.mocked(collectionsService.collectionsService.addModsToCollection).mockResolvedValue({
      message: 'Successfully added mod to collection',
    })

    const { result } = renderHook(() => useCollections(), { wrapper })

    await waitFor(() => {
      expect(result.current.collections).toHaveLength(2)
    })

    await act(async () => {
      await result.current.addModsToCollection(1, [2])
    })

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['collections'] })
    })
  })
})

describe('useCollections Hook - Mod Reordering', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(collectionsService.collectionsService.getCollections).mockResolvedValue(
      mockCollections
    )
  })

  it('reorders mod in collection successfully', async () => {
    vi.mocked(collectionsService.collectionsService.reorderModInCollection).mockResolvedValue({
      message: 'Successfully updated collection load order',
    })

    const { result } = renderHook(() => useCollections(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.collections).toHaveLength(2)
    })

    await act(async () => {
      await result.current.reorderModInCollection(1, 1, 3) // Move mod 1 to position 3
    })

    expect(collectionsService.collectionsService.reorderModInCollection).toHaveBeenCalledWith(
      1,
      1,
      3
    )
  })

  it('handles reorder error and refetches', async () => {
    const error = new Error('Invalid load order')
    vi.mocked(collectionsService.collectionsService.reorderModInCollection).mockRejectedValue(error)

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

    const { result } = renderHook(() => useCollections(), { wrapper })

    await waitFor(() => {
      expect(result.current.collections).toHaveLength(2)
    })

    let error_thrown = false
    await act(async () => {
      try {
        await result.current.reorderModInCollection(1, 1, 999)
      } catch {
        error_thrown = true
      }
    })

    expect(error_thrown).toBe(true)

    await waitFor(() => {
      expect(mockHandleApiError).toHaveBeenCalledWith(error, 'Failed to reorder mod in collection')
      // Should invalidate cache on error to get correct server state
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['collections'] })
    })
  })

  it('does not invalidate cache on successful reorder (optimistic)', async () => {
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

    vi.mocked(collectionsService.collectionsService.reorderModInCollection).mockResolvedValue({
      message: 'Successfully updated collection load order',
    })

    const { result } = renderHook(() => useCollections(), { wrapper })

    await waitFor(() => {
      expect(result.current.collections).toHaveLength(2)
    })

    await act(async () => {
      await result.current.reorderModInCollection(1, 1, 2)
    })

    // Should NOT invalidate on success for optimistic updates
    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ['collections'] })
  })
})

describe('useCollections Hook - Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(collectionsService.collectionsService.getCollections).mockResolvedValue(
      mockCollections
    )
  })

  it('finds collection by ID', async () => {
    const { result } = renderHook(() => useCollections(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.collections).toHaveLength(2)
    })

    // Note: findCollection is not exposed, but we can test indirectly through operations
    // that use it like updateCollection
    await act(async () => {
      await result.current.updateCollection(1, {
        name: 'Updated',
        description: 'Updated desc',
      })
    })

    expect(collectionsService.collectionsService.updateCollection).toHaveBeenCalled()
  })

  it('handles operations on non-existent collection', async () => {
    const { result } = renderHook(() => useCollections(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.collections).toHaveLength(2)
    })

    await act(async () => {
      await result.current.updateCollectionName(999, 'Non-existent')
    })

    // Should not call API for non-existent collection
    expect(collectionsService.collectionsService.updateCollection).not.toHaveBeenCalled()
  })
})
