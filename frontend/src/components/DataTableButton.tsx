import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DataTableButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode
}

/**
 * DataTableButton Component
 *
 * A standardized button component for use in data tables.
 * Features:
 * - Consistent sizing (h-8)
 * - Reduced horizontal padding (px-2.5)
 * - Rounded corners (rounded-lg)
 * - Primary background by default
 *
 * @example
 * ```tsx
 * <DataTableButton onClick={handleClick}>
 *   New
 * </DataTableButton>
 * ```
 */
export function DataTableButton({
  children,
  className,
  size = 'sm',
  ...props
}: DataTableButtonProps) {
  return (
    <Button size={size} className={cn('h-8 px-2.5 rounded-lg', className)} {...props}>
      {children}
    </Button>
  )
}
