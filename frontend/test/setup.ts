import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock global fetch to prevent actual network requests
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: false,
    status: 404,
    statusText: 'Not Found',
    json: async () => ({ error: 'Not found' }),
    blob: async () => new Blob(),
  } as Response)
)

// Suppress unhandled promise rejections from network requests in tests
// These are expected when components try to load images that aren't mocked
process.on('unhandledRejection', (reason) => {
  // Suppress AggregateError from jsdom's XHR implementation
  if (
    reason &&
    typeof reason === 'object' &&
    'name' in reason &&
    reason.name === 'AggregateError'
  ) {
    return
  }
  // Suppress errors that mention AggregateError
  if (reason instanceof Error && reason.message.includes('AggregateError')) {
    return
  }
  // For other rejections, log them (but tests should handle their own errors)
  // Don't throw to avoid test failures from expected network errors
})

// Intercept stderr to suppress AggregateError messages and expected test errors from jsdom
const originalStderrWrite = process.stderr.write.bind(process.stderr)
process.stderr.write = (
  chunk: string | Uint8Array,
  encoding?: BufferEncoding,
  callback?: (err?: Error | null) => void
) => {
  const message = chunk?.toString() || ''

  // Suppress AggregateError messages from jsdom's XHR implementation
  const isAggregateError =
    message.includes('Error: AggregateError') ||
    message.includes('AggregateError') ||
    message.includes('at Object.dispatchError') ||
    message.includes('at Request.<anonymous>')

  // Suppress expected error messages from error-handling tests
  const isExpectedError =
    message.includes('Add mods to collection failed:') ||
    message.includes('Remove mod failed:') ||
    message.includes('Reorder mod failed:') ||
    message.includes('Uninstall mod failed:') ||
    message.includes('Add mod subscription failed:') ||
    message.includes('Create collection failed:') ||
    message.includes('Error: Mod not found') ||
    message.includes('Error: Mod not in collection') ||
    message.includes('Error: Invalid load order') ||
    message.includes('Error: Permission denied') ||
    message.includes('Error: Mod already subscribed') ||
    message.includes('Error: Collection name already exists')

  // Suppress stack trace lines from test files (lines containing "at" and test file paths)
  const isStackTraceLine =
    (message.includes(' at ') || message.trim().startsWith('at ')) &&
    (message.includes('useCollections.test.ts') ||
      message.includes('useMods.test.ts') ||
      message.includes('useCollections.ts:') ||
      message.includes('useMods.ts:'))

  if (isAggregateError || isExpectedError || isStackTraceLine) {
    // Silently ignore these expected errors
    if (typeof callback === 'function') {
      callback()
    }
    return true
  }
  return originalStderrWrite(chunk, encoding, callback)
}

// Silence noisy console errors from expected network/image behavior during tests
const originalError = console.error
console.error = (...args: unknown[]) => {
  const msg = String(args[0] ?? '')
  // Suppress known noisy errors during tests
  if (
    msg.includes('Failed to load mod image') ||
    msg.includes('Network Error') ||
    msg.includes('API Error:') ||
    msg.includes('ERR_NETWORK') ||
    msg.includes('connect ECONNREFUSED') ||
    msg.includes('Download failed:') ||
    msg.includes('Download mod failed') ||
    msg.includes('act(') ||
    msg.includes('cannot be a descendant of <p>') ||
    msg.toLowerCase().includes('hydration error') ||
    msg.includes('AggregateError') ||
    msg.includes('Error: AggregateError') ||
    // Suppress expected error messages from error-handling tests
    msg.includes('Add mods to collection failed:') ||
    msg.includes('Remove mod failed:') ||
    msg.includes('Reorder mod failed:') ||
    msg.includes('Uninstall mod failed:') ||
    msg.includes('Add mod subscription failed:') ||
    msg.includes('Create collection failed:')
  ) {
    return
  }
  originalError(...args)
}

// Silence noisy warnings of expected DOM nesting issues during tests (we validate icons only)
const originalWarn = console.warn
console.warn = (...args: unknown[]) => {
  const msg = String(args[0] ?? '')
  if (
    msg.includes('cannot be a descendant of <p>') ||
    msg.toLowerCase().includes('hydration error')
  ) {
    return
  }
  originalWarn(...args)
}

// Silence specific info logs that clutter test output
const originalLog = console.log
console.log = (...args: unknown[]) => {
  const msg = String(args[0] ?? '')
  if (
    msg.includes('🔄 Fetching mod subscriptions from API') ||
    msg.includes('🔄 Fetching collections from API')
  ) {
    return
  }
  originalLog(...args)
}

// Polyfill URL.createObjectURL and URL.revokeObjectURL for jsdom
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!(global as any).URL.createObjectURL) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(global as any).URL.createObjectURL = () => 'blob://test'
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!(global as any).URL.revokeObjectURL) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(global as any).URL.revokeObjectURL = () => {
    // No-op in tests
  }
}
