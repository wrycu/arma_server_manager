/// <reference types="vitest/globals" />
import React from 'react'
import { render } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

import { ModsList } from '@/components/CollectionsModsList'
import * as modsService from '@/services/mods.service'
import type { ModSubscription } from '@/types/mods'

// Mock image fetch used by component
vi.mock('@/services/mods.service')

const baseMod: ModSubscription = {
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
}

const renderWithMod = (mod: Partial<ModSubscription>) => {
  vi.mocked(modsService.modService.getModSubscriptionImage).mockResolvedValue(new Blob())

  render(
    <ModsList
      mods={[{ ...baseMod, ...mod }] as ModSubscription[]}
      collectionId={42}
      onRemoveMod={vi.fn()}
      onAddMods={vi.fn()}
      onModClick={vi.fn()}
      onReorderMod={vi.fn()}
      onDownload={vi.fn()}
    />
  )
}

describe('CollectionsModsList - status rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders check icon when installed and no newer Steam update', async () => {
    renderWithMod({
      localPath: '/path',
      shouldUpdate: true,
      lastUpdated: '2024-01-02T00:00:00Z',
      steamLastUpdated: '2024-01-01T00:00:00Z',
    })

    const icon = document.querySelector('svg.tabler-icon-check')
    expect(icon).toBeInTheDocument()
  })

  it('renders alert icon (orange) when installed and Steam is newer', async () => {
    renderWithMod({
      localPath: '/path',
      shouldUpdate: true,
      lastUpdated: '2024-01-01T00:00:00Z',
      steamLastUpdated: '2024-01-02T00:00:00Z',
    })

    const icon = document.querySelector('svg.tabler-icon-alert-circle')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('text-orange-600')
  })

  it('renders cloud-download icon when not installed and idle', async () => {
    renderWithMod({
      localPath: null,
      status: 'not_installed',
    })

    const icon = document.querySelector('svg.tabler-icon-cloud-download')
    expect(icon).toBeInTheDocument()
  })

  it('renders loader icon when status is install_requested', async () => {
    renderWithMod({
      localPath: null,
      status: 'install_requested',
    })

    const icon = document.querySelector('svg.tabler-icon-loader-2')
    expect(icon).toBeInTheDocument()
  })

  it('renders alert icon (red) when status is install_failed', async () => {
    renderWithMod({
      localPath: null,
      status: 'install_failed',
    })

    const icon = document.querySelector('svg.tabler-icon-alert-circle')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('text-red-600')
  })
})
