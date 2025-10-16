import '@testing-library/jest-dom/vitest'
// Silence noisy console errors from expected network/image behavior during tests
const originalError = console.error
console.error = (...args: unknown[]) => {
  const msg = String(args[0] ?? '')
  // Suppress known noisy errors during tests
  if (
    msg.includes('Failed to load mod image') ||
    msg.includes('Network Error') ||
    msg.includes('connect ECONNREFUSED') ||
    msg.includes('Download failed:') ||
    msg.includes('Download mod failed') ||
    msg.includes('act(') ||
    msg.includes('cannot be a descendant of <p>') ||
    msg.toLowerCase().includes('hydration error')
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
  if (msg.includes('🔄 Fetching mod subscriptions from API')) {
    return
  }
  originalLog(...args)
}

// Polyfill URL.createObjectURL for jsdom
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!(global as any).URL.createObjectURL) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(global as any).URL.createObjectURL = () => 'blob://test'
}
