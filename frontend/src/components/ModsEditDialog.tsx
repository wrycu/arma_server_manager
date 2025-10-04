import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import type { ModSubscription } from '@/types/mods'

interface ModsEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mod: ModSubscription | null
  onSave: (
    steamId: number,
    updates: { arguments: string | null; isServerMod: boolean }
  ) => Promise<void>
}

export function ModsEditDialog({ open, onOpenChange, mod, onSave }: ModsEditDialogProps) {
  const [arguments_, setArguments] = useState<string>('')
  const [isServerMod, setIsServerMod] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState(false)

  // Reset form when mod changes or dialog opens
  useEffect(() => {
    if (mod && open) {
      setArguments(mod.arguments || '')
      setIsServerMod(mod.isServerMod)
    }
  }, [mod, open])

  const handleSave = async () => {
    if (!mod) return

    setIsSaving(true)
    try {
      await onSave(mod.steamId, {
        arguments: arguments_.trim() || null,
        isServerMod,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save mod updates:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!mod) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl">Edit Mod Settings</DialogTitle>
          <DialogDescription className="text-base">
            Update the server configuration for <strong>{mod.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Mod Info Section - Clean, minimal style */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground w-20">Steam ID</span>
              <span className="font-medium">{mod.steamId}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground w-20">Filename</span>
              <span className="font-medium text-sm">{mod.filename}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Server Mod Checkbox */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="server-mod"
              checked={isServerMod}
              onCheckedChange={(checked) => setIsServerMod(checked as boolean)}
              className="mt-0.5"
            />
            <div className="space-y-1 flex-1">
              <Label
                htmlFor="server-mod"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Server-side only mod
              </Label>
              <p className="text-sm text-muted-foreground leading-snug">
                Enable if this mod only needs to run on the server
              </p>
            </div>
          </div>

          {/* Arguments Textarea */}
          <div className="space-y-3">
            <Label htmlFor="arguments" className="text-sm font-medium">
              Command line arguments
            </Label>
            <Textarea
              id="arguments"
              placeholder="e.g., -serverMod -filePatching"
              value={arguments_}
              onChange={(e) => setArguments(e.target.value)}
              rows={4}
              className="font-mono text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Optional command line arguments to pass when loading this mod
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
