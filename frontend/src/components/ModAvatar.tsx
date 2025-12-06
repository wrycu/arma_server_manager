import { useEffect, useMemo, useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { mods } from '@/services'
import { blobUrlCache } from '@/lib/helpers/blobUrlCache'

interface ModAvatarProps {
  modId: number
  name: string
  imageAvailable: boolean
  className?: string
}

export function ModAvatar({ modId, name, _imageAvailable, className }: ModAvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const loadedModIdRef = useRef<number | null>(null)
  const cacheKey = `mod-${modId}`

  // Memoize queryFn to prevent new function reference on every render
  const imageQueryFn = useMemo(() => () => mods.getModSubscriptionImage(modId), [modId])

  // Fetch image - we always try to load it, even if imageAvailable is false
  // The backend will return an error if the image isn't available, which we handle gracefully
  const { data: imageBlob } = useQuery({
    queryKey: ['mod-image', modId],
    queryFn: imageQueryFn,
    enabled: true, // Always try to load images
    staleTime: Infinity, // Images don't change frequently
    gcTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: false, // Don't retry if image isn't available
  })

  // Create or retrieve cached object URL and preload the image
  useEffect(() => {
    if (imageBlob) {
      // Get or create cached URL (increments ref count)
      const url = blobUrlCache.getOrCreate(cacheKey, imageBlob)

      // Preload the image
      const img = new Image()
      img.onload = () => {
        setImageUrl(url)
        setImageLoaded(true)
        loadedModIdRef.current = modId
      }
      img.onerror = () => {
        // Image failed to load - mark as loaded to show fallback instead of infinite loading
        console.warn(`Failed to load image for mod ${modId}`)
        setImageLoaded(true)
        setImageUrl(null)
        loadedModIdRef.current = modId
      }
      img.src = url
      imgRef.current = img
    }
  }, [imageBlob, modId, cacheKey])

  // Reset loaded state only when modId actually changes to a different value
  useEffect(() => {
    if (loadedModIdRef.current !== null && loadedModIdRef.current !== modId) {
      setImageLoaded(false)
      setImageUrl(null)
    }
  }, [modId])

  // Release reference on unmount
  useEffect(() => {
    return () => {
      // Release the cache reference (only revokes when ref count reaches 0)
      blobUrlCache.release(cacheKey)

      if (imgRef.current) {
        imgRef.current.onload = null
        imgRef.current.onerror = null
        imgRef.current = null
      }
    }
  }, [cacheKey])

  // Get first letter of mod name for fallback
  const fallbackLetter = name.charAt(0).toUpperCase()

  return (
    <Avatar className={className}>
      {imageLoaded && imageUrl ? (
        <img src={imageUrl} alt={name} className="aspect-square size-full object-cover" />
      ) : (
        <AvatarFallback className="bg-muted text-muted-foreground">
          <span className="text-xs font-medium">{fallbackLetter}</span>
        </AvatarFallback>
      )}
    </Avatar>
  )
}
