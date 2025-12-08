import * as React from 'react'
import { CommandPaletteContext } from '@/contexts/CommandPaletteContext'

export function useCommandPalette() {
  const context = React.useContext(CommandPaletteContext)
  if (!context) {
    throw new Error('useCommandPalette must be used within CommandPaletteProvider')
  }
  return context
}
