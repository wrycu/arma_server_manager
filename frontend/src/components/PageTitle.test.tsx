/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { PageTitle } from '@/components/PageTitle'

describe('PageTitle breadcrumbs', () => {
  it('renders title without breadcrumbs', () => {
    render(<PageTitle title="Dashboard" />)
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.queryByText('/')).not.toBeInTheDocument()
  })

  it('renders breadcrumbs with separators and enables/disables items correctly', async () => {
    const user = userEvent.setup()
    const onHome = vi.fn()
    const onServers = vi.fn()
    const breadcrumbs = [
      { label: 'Home', onClick: onHome },
      { label: 'Servers', onClick: onServers },
      { label: 'Server 1' },
    ]

    render(<PageTitle title="Config" breadcrumbs={breadcrumbs} />)

    const homeBtn = screen.getByRole('button', { name: 'Home' })
    const serversBtn = screen.getByRole('button', { name: 'Servers' })
    const server1Btn = screen.getByRole('button', { name: 'Server 1' })

    expect(homeBtn).toBeEnabled()
    expect(serversBtn).toBeEnabled()
    expect(server1Btn).toBeDisabled()

    await user.click(homeBtn)
    await user.click(serversBtn)
    expect(onHome).toHaveBeenCalledTimes(1)
    expect(onServers).toHaveBeenCalledTimes(1)

    const slashes = screen.getAllByText('/')
    expect(slashes).toHaveLength(breadcrumbs.length)

    expect(screen.getByRole('heading', { name: /config$/i })).toBeInTheDocument()
  })
})
