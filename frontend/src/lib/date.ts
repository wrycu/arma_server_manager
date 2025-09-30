/**
 * Date formatting utilities
 */

/**
 * Formats a date string to a localized short format
 * @param dateStr - ISO date string
 * @returns Formatted date string (e.g., "Dec 25, 2:30 PM")
 */
export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formats a date string to a localized date-only format
 * @param dateStr - ISO date string
 * @returns Formatted date string (e.g., "Dec 25, 2024")
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Formats a date string to a localized time-only format
 * @param dateStr - ISO date string
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
