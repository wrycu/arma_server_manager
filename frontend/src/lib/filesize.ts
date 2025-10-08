/**
 * File size formatting utilities
 */

/**
 * Formats a file size in bytes to a human-readable string with appropriate units
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (defaults to 3 for KB, 2 for larger units)
 * @returns Formatted file size string (e.g., "49.503 KB", "1.25 MB", "2.10 GB")
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || bytes === 0) {
    return 'Unknown'
  }

  const kilobytes = bytes / 1024
  const megabytes = kilobytes / 1024
  const gigabytes = megabytes / 1024

  // Use KB for files < 1 MB with 3 decimal places for precision
  if (megabytes < 1) {
    return `${kilobytes.toFixed(3)} KB`
  }

  // Use MB for files < 1 GB with 2 decimal places
  if (gigabytes < 1) {
    return `${megabytes.toFixed(2)} MB`
  }

  // Use GB for larger files with 2 decimal places
  return `${gigabytes.toFixed(2)} GB`
}
