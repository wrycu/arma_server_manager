import * as React from 'react'
import { cn } from '@/lib/utils'

interface CollapsibleProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  asChild?: boolean
}

interface CollapsibleContentProps {
  children: React.ReactNode
  className?: string
}

const CollapsibleContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {},
})

export function Collapsible({ open, onOpenChange, children, className }: CollapsibleProps) {
  const [internalOpen, setInternalOpen] = React.useState(open ?? false)

  const isControlled = open !== undefined

  const actualOpen = isControlled ? open : internalOpen

  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    },
    [isControlled, onOpenChange]
  )

  React.useEffect(() => {
    if (isControlled && open !== undefined) {
      setInternalOpen(open)
    }
  }, [isControlled, open])

  return (
    <CollapsibleContext.Provider value={{ open: actualOpen, setOpen }}>
      <div className={cn(className)}>{children}</div>
    </CollapsibleContext.Provider>
  )
}

export const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ children, asChild, ...props }, ref) => {
    const { open, setOpen } = React.useContext(CollapsibleContext)

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          setOpen(!open)
          children.props.onClick?.(e)
          props.onClick?.(e)
        },
        ref,
      } as React.HTMLAttributes<HTMLElement>)
    }

    return (
      <button ref={ref} onClick={() => setOpen(!open)} {...props}>
        {children}
      </button>
    )
  }
)

CollapsibleTrigger.displayName = 'CollapsibleTrigger'

export function CollapsibleContent({ children, className }: CollapsibleContentProps) {
  const { open } = React.useContext(CollapsibleContext)
  const [height, setHeight] = React.useState<number | 'auto'>(0)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (open && contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
      // After animation completes, set to auto for dynamic content
      const timer = setTimeout(() => {
        setHeight('auto')
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setHeight(0)
    }
  }, [open])

  return (
    <div
      style={{
        height: height === 'auto' ? 'auto' : `${height}px`,
        overflow: 'hidden',
        transition: 'height 300ms ease-in-out',
      }}
      className={cn(className)}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  )
}
