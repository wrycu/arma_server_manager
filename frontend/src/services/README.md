# Services Architecture

This directory contains the API services for the ARMA Server Manager frontend. The architecture is designed to be simple and clean, with easy switching between real and mock data.

## Structure

```
services/
├── index.ts              # Main service exports (real or mock based on environment)
├── api.ts                # Base API client configuration
├── arma3/                # Real API services
│   ├── collectionsService.ts
│   ├── serverService.ts
│   └── modService.ts
└── README.md             # This file
```

## Usage

The services are automatically configured to use either real or mock data based on the environment:

- **Development**: Uses mock data by default (can be overridden with `VITE_USE_MOCK_DATA=false`)
- **Production**: Uses real API services

### Importing Services

```typescript
import { collections, server, mods } from "@/services"

// Use collections service
const allCollections = await collections.getCollections()
const newCollection = await collections.createCollection({
  name: "My Collection",
  description: "Description",
})

// Use server service
const serverStatus = await server.getServerStatus()
await server.performServerAction({ action: "start", collectionId: 1 })

// Use mods service
const modSubscriptions = await mods.getModSubscriptions()
const modHelper = await mods.getModHelper(12345)
```

## Environment Configuration

Set `VITE_USE_MOCK_DATA=true` in your `.env` file to force mock data usage, even in development.

## Mock Data

Mock data is defined in `@/lib/mock-data.ts` and provides realistic test data for development and testing. The mock services follow the same interface as the real services, making them completely interchangeable.

## Adding New Services

1. Create the real service in the appropriate subdirectory (e.g., `arma3/`)
2. Add the corresponding mock service to `@/lib/mock-data.ts`
3. Export both from `services/index.ts` with the environment-based selection

This approach ensures:

- **Simplicity**: No complex smart API logic
- **Consistency**: Same interface for real and mock services
- **Flexibility**: Easy to switch between real and mock data
- **Maintainability**: Clear separation of concerns
