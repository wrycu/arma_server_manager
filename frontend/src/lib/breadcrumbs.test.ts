/// <reference types="vitest/globals" />
import { buildBreadcrumbsFromPath } from './breadcrumbs'

describe('buildBreadcrumbsFromPath', () => {
  it('returns empty for root-like paths', () => {
    const spy = vi.fn()
    expect(buildBreadcrumbsFromPath('/', spy)).toEqual([])
    expect(buildBreadcrumbsFromPath('///', spy)).toEqual([])
    expect(buildBreadcrumbsFromPath('', spy)).toEqual([])
  })

  it('builds clickable prefixes for all but the last segment', () => {
    const nav = vi.fn()
    const items = buildBreadcrumbsFromPath('/servers/server-1/config', nav)

    expect(items.map((i) => i.label)).toEqual(['Servers', 'Server 1', 'Config'])

    // First two clickable
    items[0].onClick?.()
    items[1].onClick?.()
    expect(nav).toHaveBeenNthCalledWith(1, '/servers')
    expect(nav).toHaveBeenNthCalledWith(2, '/servers/server-1')

    // Last should be undefined by default
    expect(items[2].onClick).toBeUndefined()
  })

  it('can make the last segment clickable when configured', () => {
    const nav = vi.fn()
    const items = buildBreadcrumbsFromPath('/a/b', nav, { clickableLast: true })
    expect(items.map((i) => !!i.onClick)).toEqual([true, true])
    items[1].onClick?.()
    expect(nav).toHaveBeenCalledWith('/a/b')
  })

  it('decodes and humanizes segments', () => {
    const nav = vi.fn()
    const items = buildBreadcrumbsFromPath('/my-project%20name/users_list', nav)
    expect(items.map((i) => i.label)).toEqual(['My Project Name', 'Users List'])
  })
})
