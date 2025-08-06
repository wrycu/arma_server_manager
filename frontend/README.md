# Frontend - Arma 3 Server Manager

React TypeScript application providing a modern web interface for Arma 3 server management.

## Architecture

### Tech Stack

- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Static typing for better developer experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: High-quality React components
- **Axios**: HTTP client for API communication
- **ESLint + Prettier**: Code linting and formatting

### Project Structure

```
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # Shadcn/UI base components
│   │   ├── CollectionManager.tsx    # Mod collection management
│   │   ├── ModBrowser.tsx           # Steam Workshop mod browser
│   │   ├── ServerConfigEditor.tsx   # Server configuration forms
│   │   ├── ServerControlPanel.tsx   # Server start/stop controls
│   │   └── app-sidebar.tsx         # Main navigation sidebar
│   ├── services/
│   │   └── api.ts           # API client and type definitions
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   ├── assets/              # Static assets
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── public/                  # Static public assets
├── dist/                    # Build output (generated)
└── package.json             # Dependencies and scripts
```

## Setup

### Prerequisites

- Node.js 18+
- pnpm package manager

### Installation

1. **Install dependencies**:

   ```bash
   cd frontend
   pnpm install
   ```

2. **Set up environment**:

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   ```

The application will be available at http://localhost:5173

## Development

### Development Commands

| Command           | Description                     |
| ----------------- | ------------------------------- |
| `pnpm dev`        | Start Vite development server   |
| `pnpm build`      | Build for production            |
| `pnpm preview`    | Preview production build        |
| `pnpm lint`       | Lint TypeScript/React code      |
| `pnpm lint:fix`   | Fix auto-fixable linting issues |
| `pnpm format`     | Format code with Prettier       |
| `pnpm type-check` | Run TypeScript compiler check   |

### Hot Module Replacement

Vite provides instant HMR for React components. Changes to TypeScript files will update in the browser without losing component state.

### Environment Configuration

Environment variables in `.env.local`:

```bash
# Backend API URL
VITE_API_BASE_URL=http://localhost:5000/api

# Environment
VITE_NODE_ENV=development

# App configuration
VITE_APP_TITLE=Arma 3 Server Manager
```

## Component Architecture

### Core Components

#### App.tsx

Main application shell with routing and global state management.

#### CollectionManager.tsx

Interface for creating and managing mod collections:

- Collection creation form
- Mod selection interface
- Collection editing and deletion

#### ModBrowser.tsx

Steam Workshop mod discovery and management:

- Mod search functionality
- Workshop integration
- Mod download status tracking

#### ServerConfigEditor.tsx

Server configuration management:

- Server settings forms
- Collection assignment
- Configuration validation

#### ServerControlPanel.tsx

Server lifecycle controls:

- Start/stop server instances
- Real-time status updates
- Log viewing

### UI Components (Shadcn/UI)

Located in `src/components/ui/`:

- `button.tsx` - Button variants and styles
- `card.tsx` - Content containers
- `input.tsx` - Form inputs
- `dialog.tsx` - Modal dialogs
- `table.tsx` - Data tables
- `sidebar.tsx` - Navigation sidebar

### Custom Hooks

Located in `src/hooks/`:

- `use-mobile.ts` - Mobile device detection
- `use-navigation.ts` - Navigation state management

## API Integration

### API Client

The `src/services/api.ts` file contains:

- Axios instance configuration
- API endpoint functions
- TypeScript type definitions
- Error handling

### Type Safety

All API responses are typed with TypeScript interfaces:

```typescript
interface Mod {
  id: number
  steam_id: string
  name: string
  type: 'mod' | 'mission' | 'map'
  server_side_only: boolean
  download_path?: string
  last_updated?: string
}

interface Collection {
  id: number
  name: string
  description?: string
  mods: Mod[]
  created_at: string
}
```

### API Usage Example

```typescript
import { api } from '../services/api'

// Fetch mods
const mods = await api.getMods()

// Create a new collection
const collection = await api.createCollection({
  name: 'Essential Mods',
  description: 'Core mods for all servers',
  mod_ids: [1, 2, 3],
})
```

## Styling

### Tailwind CSS

The project uses Tailwind CSS for styling with custom configuration:

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Custom color palette
      },
    },
  },
}
```

### Component Styling

Components use Tailwind utility classes:

```tsx
<div className="flex flex-col space-y-4 p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-800">Server Configuration</h2>
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    Save Configuration
  </button>
</div>
```

### Shadcn/UI Integration

Shadcn/UI components are customized through the `src/lib/utils.ts` file and can be modified via the `components.json` configuration.

## State Management

### Local State

Components use React hooks for local state management:

```tsx
const [mods, setMods] = useState<Mod[]>([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
```

### API State

API calls are handled with custom hooks for data fetching:

```tsx
const useMods = () => {
  const [mods, setMods] = useState<Mod[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getMods()
      .then(setMods)
      .finally(() => setLoading(false))
  }, [])

  return { mods, loading }
}
```

## Building and Deployment

### Production Build

```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview
```

The build output will be in the `dist/` directory.

### Deployment Options

#### Static Hosting

Deploy the `dist/` folder to any static hosting service:

- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

#### Docker

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Environment Variables for Production

Update `.env.production`:

```bash
VITE_API_BASE_URL=https://api.yourserver.com/api
VITE_NODE_ENV=production
```

## Code Quality

### ESLint Configuration

The project uses ESLint with TypeScript and React rules:

```javascript
// eslint.config.js
export default [
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      'eslint:recommended',
      '@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
    ],
  },
]
```

### Prettier Configuration

Code formatting is handled by Prettier:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### TypeScript Configuration

Strict TypeScript configuration for better type safety:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Testing

### Testing Setup

The project is configured for testing with Vitest and React Testing Library:

```bash
# Install testing dependencies
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

### Example Test

```typescript
import { render, screen } from '@testing-library/react';
import { ModBrowser } from '../components/ModBrowser';

test('renders mod browser component', () => {
  render(<ModBrowser />);
  expect(screen.getByText('Steam Workshop Mods')).toBeInTheDocument();
});
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Default port 5173 might be in use

   ```bash
   pnpm dev --port 3000
   ```

2. **API connection errors**: Verify backend is running and VITE_API_BASE_URL is correct

3. **Build errors**: Clear node_modules and reinstall

   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

4. **TypeScript errors**: Run type check to see all issues

   ```bash
   pnpm type-check
   ```

5. **Styling issues**: Ensure Tailwind CSS is properly configured and imported

### Debug Mode

Enable verbose logging:

```bash
DEBUG=vite:* pnpm dev
```

### Browser DevTools

Use React Developer Tools for component inspection and debugging:

- Install React DevTools browser extension
- Use the Components and Profiler tabs
- Monitor component renders and state changes
