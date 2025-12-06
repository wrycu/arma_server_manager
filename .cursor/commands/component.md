Create a new React component following this project's architecture and conventions.

## Project Component Standards

### Technology Stack
- **React 19** with TypeScript
- **Shadcn/UI** components for UI primitives
- **Tailwind CSS** for styling
- **TanStack Query** for data fetching
- **TanStack Router** for navigation
- **Lucide React** for icons

### Component Location
- Place in `frontend/src/components/`
- Use PascalCase for filenames: `ComponentName.tsx`
- Colocate tests: `ComponentName.test.tsx`

### Component Structure

```typescript
import * as React from 'react'
import { ComponentType } from '@/components/ui/component-name'
import { Button } from '@/components/ui/button'

interface ComponentNameProps {
  // Define props with clear types
  title: string
  onAction?: () => void
  className?: string
}

export function ComponentName({ title, onAction, className }: ComponentNameProps) {
  // Component implementation
  return (
    <div className={className}>
      <h2>{title}</h2>
      {onAction && <Button onClick={onAction}>Action</Button>}
    </div>
  )
}
```

## Component Guidelines

### 1. TypeScript Best Practices
- Define explicit prop interfaces
- Use `type` for unions, `interface` for object shapes
- Avoid `any` - use proper types or `unknown`
- Export interfaces if they're used elsewhere

### 2. Styling with Tailwind
- Use Tailwind utility classes
- Support `className` prop for composition
- Use `cn()` from `@/lib/utils` to merge classes
- Follow existing color schemes and spacing

### 3. State Management
- Use React hooks (`useState`, `useEffect`, etc.)
- For server state, use TanStack Query hooks from `@/hooks/`
- Keep component state minimal and focused
- Lift state up when shared across components

### 4. Data Fetching
- Use existing hooks from `@/hooks/` directory:
  - `useCollections` - for collection data
  - `useMods` - for mod data
  - `useServer` - for server status
  - `useSchedules` - for schedule data
- If creating new data hooks, place them in `@/hooks/`
- Follow TanStack Query patterns with proper cache keys

### 5. UI Components from Shadcn
Available components in `@/components/ui/`:
- `button`, `input`, `label`, `select`
- `dialog`, `sheet`, `popover`, `dropdown-menu`
- `table`, `card`, `tabs`, `separator`
- `avatar`, `badge`, `progress`, `switch`
- And more - check `frontend/src/components/ui/`

### 6. Navigation
- Use TanStack Router's `useNavigate` hook
- Define routes in `frontend/src/routes/`
- Use `Link` component for navigation

### 7. Accessibility
- Use semantic HTML elements
- Include ARIA labels when needed
- Use Shadcn components (they have accessibility built-in)
- Test with keyboard navigation

### 8. Code Organization
- Keep components focused and single-purpose
- Extract complex logic to hooks (in `@/hooks/`)
- Extract utilities to helpers (in `@/lib/helpers/`)
- Use composition over large components

## Example Patterns from Codebase

### Data Table Component
See `frontend/src/components/ModsDataTable.tsx` for patterns on:
- TanStack Table integration
- Pagination and filtering
- Row selection
- Action buttons

### Dialog/Modal Pattern
See `frontend/src/components/CollectionsCreateDialog.tsx` for:
- Dialog state management
- Form handling
- API mutations with TanStack Query

### List Items
See `frontend/src/components/CollectionItem.tsx` for:
- Card-based layouts
- Context menus
- Action buttons

## Instructions

Based on the user's request, create a new React component that:
1. Follows all the conventions above
2. Uses appropriate Shadcn/UI components
3. Has proper TypeScript types
4. Includes accessibility features
5. Follows the styling patterns from existing components
6. Is well-structured and maintainable

If the component needs data fetching, use or suggest creating appropriate hooks. If it needs complex logic, suggest extracting it to helpers.

