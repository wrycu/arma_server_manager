import * as React from 'react'

const STORAGE_KEY = 'dataTableRowsPerPage'
const DEFAULT_PAGE_SIZE = 20
const VALID_PAGE_SIZES = [20, 50, 100] as const

type PageSize = (typeof VALID_PAGE_SIZES)[number]

/**
 * Hook to manage data table pagination preference in localStorage.
 * Persists the user's preferred rows per page setting across sessions.
 *
 * @returns A tuple of [pageSize, setPageSize]
 */
export function useDataTablePagination(): [number, (size: number) => void] {
  const [pageSize, setPageSizeState] = React.useState<number>(() => {
    // Initialize from localStorage on mount
    if (typeof window === 'undefined') {
      return DEFAULT_PAGE_SIZE
    }

    // Check if localStorage is available
    let storage: Storage | null = null
    try {
      storage = window.localStorage
    } catch {
      // localStorage may not be available in some environments (e.g., private browsing)
      return DEFAULT_PAGE_SIZE
    }

    if (!storage) {
      return DEFAULT_PAGE_SIZE
    }

    try {
      const stored = storage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = Number.parseInt(stored, 10)
        // Validate that the stored value is one of the valid options
        if (VALID_PAGE_SIZES.includes(parsed as PageSize)) {
          return parsed
        }
      }
    } catch (error) {
      // Silently fail in test environments
      if (process.env.NODE_ENV !== 'test') {
        console.warn('Failed to read pagination preference from localStorage:', error)
      }
    }

    return DEFAULT_PAGE_SIZE
  })

  const setPageSize = React.useCallback((size: number) => {
    // Validate the size is one of the valid options
    if (!VALID_PAGE_SIZES.includes(size as PageSize)) {
      console.warn(`Invalid page size: ${size}. Must be one of: ${VALID_PAGE_SIZES.join(', ')}`)
      return
    }

    setPageSizeState(size)

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      try {
        const storage = window.localStorage
        if (storage) {
          storage.setItem(STORAGE_KEY, String(size))
        }
      } catch (error) {
        // Silently fail in test environments
        if (process.env.NODE_ENV !== 'test') {
          console.warn('Failed to save pagination preference to localStorage:', error)
        }
      }
    }
  }, [])

  return [pageSize, setPageSize]
}
