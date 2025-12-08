/// <reference types="vitest/globals" />
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ModsList } from '@/components/CollectionsModsList'
import { getModStatus } from '@/lib/modStatus'
import * as modsService from '@/services/mods.service'
import type { ModSubscription } from '@/types/mods'

vi.mock('@/services/mods.service')

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

const createMod = (overrides: Partial<ModSubscription> = {}): ModSubscription => ({
  id: 1,
  steamId: 111,
  filename: '@Test',
  name: 'Test Mod',
  modType: 'mod',
  localPath: null,
  isServerMod: false,
  sizeBytes: 1000,
  size: '1000.000 KB',
  lastUpdated: null,
  steamLastUpdated: null,
  shouldUpdate: false,
  imageAvailable: false,
  ...overrides,
})

const renderModsList = (
  mods: ModSubscription[],
  handlers: {
    onRemoveMod?: ReturnType<typeof vi.fn>
    onAddMods?: ReturnType<typeof vi.fn>
    onModClick?: ReturnType<typeof vi.fn>
    onDownload?: ReturnType<typeof vi.fn>
  } = {}
) => {
  vi.mocked(modsService.modService.getModSubscriptionImage).mockResolvedValue(new Blob())

  const defaultHandlers = {
    onRemoveMod: vi.fn(),
    onAddMods: vi.fn(),
    onModClick: vi.fn(),
    onReorderMod: vi.fn(),
    onDownload: vi.fn(),
    ...handlers,
  }

  return {
    ...render(
      <TestWrapper>
        <ModsList mods={mods} collectionId={42} {...defaultHandlers} />
      </TestWrapper>
    ),
    handlers: defaultHandlers,
  }
}

describe('getModStatus', () => {
  it('returns "up-to-date" for installed mod with no update available', () => {
    const mod = createMod({
      localPath: '/path',
      shouldUpdate: true,
      lastUpdated: '2024-01-02T00:00:00Z',
      steamLastUpdated: '2024-01-01T00:00:00Z',
    })

    const status = getModStatus(mod)

    expect(status.type).toBe('up-to-date')
    expect(status.label).toBe('Up to date')
  })

  it('returns "update-available" when Steam version is newer', () => {
    const mod = createMod({
      localPath: '/path',
      shouldUpdate: true,
      lastUpdated: '2024-01-01T00:00:00Z',
      steamLastUpdated: '2024-01-02T00:00:00Z',
    })

    const status = getModStatus(mod)

    expect(status.type).toBe('update-available')
    expect(status.label).toBe('Update available')
  })

  it('returns "updating" when update is in progress', () => {
    const mod = createMod({
      localPath: '/path',
      status: 'update_requested',
    })

    const status = getModStatus(mod)

    expect(status.type).toBe('updating')
    expect(status.label).toBe('Updating…')
  })

  it('returns "not-downloaded" for uninstalled mod', () => {
    const mod = createMod({
      localPath: null,
      status: 'not_installed',
    })

    const status = getModStatus(mod)

    expect(status.type).toBe('not-downloaded')
    expect(status.label).toBe('Not downloaded')
  })

  it('returns "downloading" when install is in progress', () => {
    const mod = createMod({
      localPath: null,
      status: 'install_requested',
    })

    const status = getModStatus(mod)

    expect(status.type).toBe('downloading')
    expect(status.label).toBe('Downloading…')
  })

  it('returns "download-failed" when install failed', () => {
    const mod = createMod({
      localPath: null,
      status: 'install_failed',
    })

    const status = getModStatus(mod)

    expect(status.type).toBe('download-failed')
    expect(status.label).toBe('Download failed')
  })

  it('returns "up-to-date" when shouldUpdate is false even if dates suggest update', () => {
    const mod = createMod({
      localPath: '/path',
      shouldUpdate: false,
      lastUpdated: '2024-01-01T00:00:00Z',
      steamLastUpdated: '2024-01-02T00:00:00Z',
    })

    const status = getModStatus(mod)

    expect(status.type).toBe('up-to-date')
  })
})

describe('ModsList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('empty state', () => {
    it('shows empty message and add button when no mods', () => {
      renderModsList([])

      expect(screen.getByTestId('mods-list-empty')).toBeInTheDocument()
      expect(screen.getByText(/no mods in this collection/i)).toBeInTheDocument()
      expect(screen.getByTestId('mods-list-add-button')).toBeInTheDocument()
    })

    it('calls onAddMods when add button is clicked', async () => {
      const user = userEvent.setup()
      const onAddMods = vi.fn()

      renderModsList([], { onAddMods })

      await user.click(screen.getByTestId('mods-list-add-button'))

      expect(onAddMods).toHaveBeenCalledWith(42)
    })
  })

  describe('mod list display', () => {
    it('renders all mods in the list', () => {
      const mods = [createMod({ name: 'Mod 1' }), createMod({ id: 2, name: 'Mod 2' })]

      renderModsList(mods)

      expect(screen.getByText('Mod 1')).toBeInTheDocument()
      expect(screen.getByText('Mod 2')).toBeInTheDocument()
      expect(screen.getByTestId('mod-item-1')).toBeInTheDocument()
      expect(screen.getByTestId('mod-item-2')).toBeInTheDocument()
    })
  })

  describe('mod status indicators', () => {
    it('shows up-to-date indicator for installed mod with no update available', () => {
      renderModsList([
        createMod({
          localPath: '/path',
          shouldUpdate: true,
          lastUpdated: '2024-01-02T00:00:00Z',
          steamLastUpdated: '2024-01-01T00:00:00Z',
        }),
      ])

      const statusIndicator = screen.getByTestId('mod-status-up-to-date')
      expect(statusIndicator).toBeInTheDocument()
      expect(statusIndicator).toHaveAttribute('aria-label', 'Up to date')
    })

    it('shows update-available indicator when Steam version is newer', () => {
      renderModsList([
        createMod({
          localPath: '/path',
          shouldUpdate: true,
          lastUpdated: '2024-01-01T00:00:00Z',
          steamLastUpdated: '2024-01-02T00:00:00Z',
        }),
      ])

      const statusIndicator = screen.getByTestId('mod-status-update-available')
      expect(statusIndicator).toBeInTheDocument()
      expect(statusIndicator).toHaveAttribute('aria-label', 'Update available')
    })

    it('shows not-downloaded indicator for uninstalled mod', () => {
      renderModsList([createMod({ localPath: null, status: 'not_installed' })])

      const statusIndicator = screen.getByTestId('mod-status-not-downloaded')
      expect(statusIndicator).toBeInTheDocument()
      expect(statusIndicator).toHaveAttribute('aria-label', 'Not downloaded')
    })

    it('shows downloading indicator when install is in progress', () => {
      renderModsList([createMod({ localPath: null, status: 'install_requested' })])

      const statusIndicator = screen.getByTestId('mod-status-downloading')
      expect(statusIndicator).toBeInTheDocument()
      expect(statusIndicator).toHaveAttribute('aria-label', 'Downloading…')
    })

    it('shows download-failed indicator when install failed', () => {
      renderModsList([createMod({ localPath: null, status: 'install_failed' })])

      const statusIndicator = screen.getByTestId('mod-status-download-failed')
      expect(statusIndicator).toBeInTheDocument()
      expect(statusIndicator).toHaveAttribute('aria-label', 'Download failed')
    })

    it('shows updating indicator when update is in progress', () => {
      renderModsList([createMod({ localPath: '/path', status: 'update_requested' })])

      const statusIndicator = screen.getByTestId('mod-status-updating')
      expect(statusIndicator).toBeInTheDocument()
      expect(statusIndicator).toHaveAttribute('aria-label', 'Updating…')
    })
  })

  describe('mod interactions', () => {
    it('calls onModClick when mod item is clicked', async () => {
      const user = userEvent.setup()
      const onModClick = vi.fn()

      renderModsList([createMod()], { onModClick })

      await user.click(screen.getByTestId('mod-item-button-1'))

      expect(onModClick).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test Mod' }))
    })

    it('calls onRemoveMod when remove button is clicked', async () => {
      const user = userEvent.setup()
      const onRemoveMod = vi.fn()

      renderModsList([createMod()], { onRemoveMod })

      await user.click(screen.getByTestId('mod-remove-button-1'))

      expect(onRemoveMod).toHaveBeenCalledWith(42, 1, 'Test Mod')
    })
  })

  describe('download functionality', () => {
    it('shows download button for uninstalled mods', () => {
      renderModsList([createMod({ localPath: null, status: 'not_installed' })])

      expect(screen.getByTestId('mod-download-button-1')).toBeInTheDocument()
    })

    it('hides download button for installed mods', () => {
      renderModsList([createMod({ localPath: '/path', status: 'installed' })])

      expect(screen.queryByTestId('mod-download-button-1')).not.toBeInTheDocument()
    })

    it('calls onDownload when download button is clicked', async () => {
      const user = userEvent.setup()
      const onDownload = vi.fn()

      renderModsList([createMod({ localPath: null, status: 'not_installed' })], { onDownload })

      await user.click(screen.getByTestId('mod-download-button-1'))

      expect(onDownload).toHaveBeenCalledWith(111)
    })

    it('disables download button during download', () => {
      renderModsList([createMod({ localPath: null, status: 'install_requested' })])

      expect(screen.getByTestId('mod-download-button-1')).toBeDisabled()
    })
  })

  describe('server mod indicator', () => {
    it('shows server mod indicator when mod is server-side', () => {
      renderModsList([createMod({ isServerMod: true })])

      const serverIndicator = screen.getByTestId('mod-server-indicator-1')
      expect(serverIndicator).toBeInTheDocument()
      expect(serverIndicator).toHaveAttribute('aria-label', 'Server-side mod')
    })

    it('does not show server mod indicator when mod is not server-side', () => {
      renderModsList([createMod({ isServerMod: false })])

      expect(screen.queryByTestId('mod-server-indicator-1')).not.toBeInTheDocument()
    })
  })
})
