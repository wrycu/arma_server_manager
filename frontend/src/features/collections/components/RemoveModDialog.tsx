import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ModToRemove } from "../types"

interface RemoveModDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  modToRemove: ModToRemove | null
  onConfirm: () => void
}

export function RemoveModDialog({
  open,
  onOpenChange,
  modToRemove,
  onConfirm,
}: RemoveModDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Remove Mod</DialogTitle>
          <DialogDescription className="text-sm">
            Remove "{modToRemove?.modName}" from this collection?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm}>
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
