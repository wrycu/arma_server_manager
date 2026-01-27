import * as React from 'react'
import { IconX } from '@tabler/icons-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface RightSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

/**
 * A reusable right sidebar component that slides in from the right
 * to display detailed information about an item from a list.
 */
export function RightSidebar({ open, onOpenChange, children, className }: RightSidebarProps) {
  // Handle ESC key to close sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }

    if (open) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onOpenChange])

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-background/20" onClick={() => onOpenChange(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full sm:w-[500px] border-l bg-background shadow-lg transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full',
          className
        )}
      >
        {children}
      </div>
    </>
  )
}

interface RightSidebarHeaderProps {
  onClose: () => void
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

/**
 * Header section for the right sidebar with a consistent close button position
 */
export function RightSidebarHeader({
  onClose,
  children,
  actions,
  className,
}: RightSidebarHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between border-b px-6 py-3.5', className)}>
      <div className="flex-1 min-w-0">{children}</div>
      <div className="flex items-center gap-1 ml-4 flex-shrink-0">
        {actions}
        <Button variant="ghost" size="icon" onClick={onClose}>
          <IconX className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
    </div>
  )
}

interface RightSidebarContentProps {
  children: React.ReactNode
  className?: string
}

/**
 * Content section for the right sidebar with proper scrolling
 */
export function RightSidebarContent({ children, className }: RightSidebarContentProps) {
  return <div className={cn('flex-1 overflow-y-auto p-6', className)}>{children}</div>
}

interface RightSidebarFooterProps {
  children: React.ReactNode
  className?: string
}

/**
 * Footer section for the right sidebar with actions (sticky to bottom)
 */
export function RightSidebarFooter({ children, className }: RightSidebarFooterProps) {
  return <div className={cn('border-t px-6 py-3', className)}>{children}</div>
}
