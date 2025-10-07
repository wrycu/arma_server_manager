/**
 * Date formatting utilities
 */

/**
 * Gets the user's locale from the browser, with fallback to 'en-US'
 */
function getUserLocale(): string {
  return typeof navigator !== 'undefined' ? navigator.language : 'en-US'
}

/**
 * Formats a date string to a localized short format
 * @param dateStr - ISO date string
 * @param locale - Optional locale string (defaults to user's browser locale)
 * @returns Formatted date string (e.g., "Dec 25, 2024, 2:30 PM" for en-US)
 */
export function formatDateTime(dateStr: string, locale?: string): string {
  return new Date(dateStr).toLocaleString(locale ?? getUserLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formats a date string to a localized date-only format
 * @param dateStr - ISO date string
 * @param locale - Optional locale string (defaults to user's browser locale)
 * @returns Formatted date string (e.g., "Dec 25, 2024" for en-US)
 */
export function formatDate(dateStr: string, locale?: string): string {
  return new Date(dateStr).toLocaleDateString(locale ?? getUserLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Formats a date string to a localized time-only format
 * @param dateStr - ISO date string
 * @param locale - Optional locale string (defaults to user's browser locale)
 * @returns Formatted time string (e.g., "2:30 PM" for en-US)
 */
export function formatTime(dateStr: string, locale?: string): string {
  return new Date(dateStr).toLocaleTimeString(locale ?? getUserLocale(), {
    hour: '2-digit',
    minute: '2-digit',
  })
}
