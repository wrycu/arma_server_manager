import { useState } from 'react'
import { IconPlus } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { handleApiError } from '@/lib/error-handler'

interface ModsSubscribeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubscribe: (steamIds: number[]) => Promise<void> | void
}

export function ModsSubscribeDialog({ open, onOpenChange, onSubscribe }: ModsSubscribeDialogProps) {
  const [inputValue, setInputValue] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const parseSteamIds = (value: string): number[] => {
    return value
      .split(/[,\s]+/)
      .map((v) => v.trim())
      .filter(Boolean)
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n) && n > 0)
  }

  const handleSubscribe = async () => {
    const ids = parseSteamIds(inputValue)
    if (ids.length === 0) return

    try {
      setSubmitting(true)
      await onSubscribe(ids)
      setInputValue('')
      onOpenChange(false)
    } catch (error) {
      handleApiError(error, 'Failed to subscribe to mods')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setInputValue('')
      setSubmitting(false)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Subscribe to Mods</DialogTitle>
          <DialogDescription className="text-sm">
            Enter Workshop IDs from Steam (separate multiple with spaces or commas)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Input
            placeholder="e.g. 123456 987654, 13579"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="h-9"
          />
          <p className="text-xs text-muted-foreground">
            Find the ID in the Steam Workshop URL after <span className="font-mono">?id=</span>
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubscribe}
            disabled={submitting || parseSteamIds(inputValue).length === 0}
          >
            <IconPlus className="h-3 w-3 mr-1" />
            {submitting ? 'Subscribing...' : 'Subscribe'}{' '}
            {!submitting && parseSteamIds(inputValue).length > 0
              ? `(${parseSteamIds(inputValue).length})`
              : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
