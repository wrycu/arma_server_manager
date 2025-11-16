/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

import { NotificationSettings } from '@/components/NotificationSettings'
import type { NotificationSettings as NotificationSettingsType } from '@/types/settings'

const baseSettings: NotificationSettingsType = {
  enableNotifications: true,
  webhookUrl: 'https://example.com/webhook',
  notificationTypes: {
    serverStartStop: true,
    modUpdates: false,
    playerEvents: false,
  },
}

describe('NotificationSettings component', () => {
  it('calls onUpdate when enabling or disabling notifications', async () => {
    const user = userEvent.setup()
    const handleUpdate = vi.fn()

    render(<NotificationSettings settings={baseSettings} onUpdate={handleUpdate} />)

    // Toggle the main enable switch
    const enableSwitch = screen.getByRole('switch', { name: /enable notifications/i })
    await user.click(enableSwitch)

    expect(handleUpdate).toHaveBeenCalled()
    const updated = handleUpdate.mock.calls[0][0] as NotificationSettingsType
    expect(updated.enableNotifications).toBe(false)
  })

  it('calls onUpdate when webhook URL changes', async () => {
    const user = userEvent.setup()
    const handleUpdate = vi.fn()

    render(<NotificationSettings settings={baseSettings} onUpdate={handleUpdate} />)

    const input = screen.getByLabelText(/webhook url/i)
    await user.clear(input)
    await user.type(input, 'https://new.example.com/hook')

    expect(handleUpdate).toHaveBeenCalled()
    const updated = handleUpdate.mock.calls.at(-1)?.[0] as NotificationSettingsType
    expect(updated.webhookUrl).toBe('https://new.example.com/hook')
  })

  it('calls onUpdate when server start/stop notification type is toggled', async () => {
    const user = userEvent.setup()
    const handleUpdate = vi.fn()

    render(<NotificationSettings settings={baseSettings} onUpdate={handleUpdate} />)

    const serverToggle = screen.getByRole('switch', { name: /server start\/stop/i })
    await user.click(serverToggle)

    expect(handleUpdate).toHaveBeenCalled()
    const updated = handleUpdate.mock.calls[0][0] as NotificationSettingsType
    expect(updated.notificationTypes.serverStartStop).toBe(false)
  })
}


