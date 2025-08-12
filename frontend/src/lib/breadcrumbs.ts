export interface BreadcrumbItemLike {
  label: string
  onClick?: () => void
}

interface BuildOptions {
  clickableLast?: boolean
}

function humanizeSegment(segment: string): string {
  const decoded = decodeURIComponent(segment)
  const spaced = decoded.replace(/[-_]+/g, ' ').trim()
  if (spaced.length === 0) return ''
  return spaced
    .split(/\s+/)
    .map((part) => (part.length > 0 ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ')
}

/**
 * Build breadcrumb items from a path, wiring `onClick` for prefix navigation.
 * - Leading/trailing slashes are ignored
 * - By default, the last segment has no `onClick` (disabled in `PageTitle`)
 */
export function buildBreadcrumbsFromPath(
  path: string,
  navigate: (to: string) => void,
  options: BuildOptions = {}
): BreadcrumbItemLike[] {
  const { clickableLast = false } = options
  const clean = path.replace(/(^\/+|\/+$)/g, '')
  if (!clean) return []
  const segments = clean.split('/')

  let prefix = ''
  return segments.map((seg, index) => {
    const currentPrefix = `${prefix}/${seg}`
    prefix = currentPrefix
    const isLast = index === segments.length - 1
    const label = humanizeSegment(seg)
    const shouldBeClickable = clickableLast || !isLast
    return shouldBeClickable ? { label, onClick: () => navigate(currentPrefix) } : { label }
  })
}
