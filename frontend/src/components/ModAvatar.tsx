import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { mods } from '@/services'

interface ModAvatarProps {
  modId: number
  name: string
  imageAvailable: boolean
  className?: string
}

export function ModAvatar({ modId, name, imageAvailable, className }: ModAvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  // Only fetch image if it's available
  const { data: imageBlob, isLoading } = useQuery({
    queryKey: ['mod-image', modId],
    queryFn: () => mods.getModSubscriptionImage(modId),
    enabled: imageAvailable,
    staleTime: Infinity, // Images don't change frequently
    gcTime: 1000 * 60 * 30, // Cache for 30 minutes
  })

  useEffect(() => {
    if (imageBlob) {
      // Create object URL from blob
      const url = URL.createObjectURL(imageBlob)
      setImageUrl(url)

      // Cleanup function to revoke object URL
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [imageBlob])

  // Get first letter of mod name for fallback
  const fallbackLetter = name.charAt(0).toUpperCase()

  // Show skeleton while loading to prevent flicker
  if (imageAvailable && (isLoading || !imageUrl)) {
    return <Skeleton className={className} style={{ borderRadius: '9999px' }} />
  }

  return (
    <Avatar className={className}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
      <AvatarFallback className="bg-muted text-muted-foreground">
        <span className="text-xs font-medium">{fallbackLetter}</span>
      </AvatarFallback>
    </Avatar>
  )
}
