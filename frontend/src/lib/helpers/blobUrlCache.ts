/**
 * Global cache for blob URLs to prevent unnecessary revocation and recreation
 * when components mount/unmount but the same images are still in use elsewhere.
 */

interface CacheEntry {
  url: string
  blob: Blob
  refCount: number
}

class BlobUrlCache {
  private cache = new Map<string, CacheEntry>()

  /**
   * Get or create a blob URL for the given key and blob.
   * Increments the reference count.
   */
  getOrCreate(key: string, blob: Blob): string {
    const existing = this.cache.get(key)

    // If we have the same blob cached, reuse the URL
    if (existing && existing.blob === blob) {
      existing.refCount++
      return existing.url
    }

    // If we have a different blob for this key, revoke the old URL
    if (existing && existing.blob !== blob) {
      URL.revokeObjectURL(existing.url)
    }

    // Create new URL
    const url = URL.createObjectURL(blob)
    this.cache.set(key, { url, blob, refCount: 1 })
    return url
  }

  /**
   * Release a reference to a blob URL.
   * Only revokes the URL when ref count reaches 0.
   */
  release(key: string): void {
    const entry = this.cache.get(key)
    if (!entry) return

    entry.refCount--

    // Only revoke and remove when no more references exist
    if (entry.refCount <= 0) {
      URL.revokeObjectURL(entry.url)
      this.cache.delete(key)
    }
  }

  /**
   * Check if a URL exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key)
  }

  /**
   * Get the cached URL without incrementing ref count
   */
  get(key: string): string | undefined {
    return this.cache.get(key)?.url
  }

  /**
   * Clear all cached URLs (for testing/cleanup)
   */
  clear(): void {
    for (const entry of this.cache.values()) {
      URL.revokeObjectURL(entry.url)
    }
    this.cache.clear()
  }
}

// Export singleton instance
export const blobUrlCache = new BlobUrlCache()
