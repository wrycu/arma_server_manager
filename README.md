# Arma 3 Server Manager

A modern Arma 3 server management application with Flask backend and React frontend for managing server configurations, mod collections, and Steam Workshop integration.

## Features

- **Server Configuration Management**: Create and manage multiple Arma 3 server configurations with custom settings
- **Mod Collection System**: Organize mods into collections and apply them to server configurations
- **Steam Workshop Integration**: Automatic mod downloading and updating via Steam Workshop
- **Background Task Processing**: Celery-powered async tasks for mod downloads and server operations
- **Modern Tech Stack**: Python + Flask + SQLAlchemy backend, React + TypeScript + Shadcn/UI frontend
- **Developer Experience**: Hot reloading, comprehensive linting, type safety, one-command startup

## Prerequisites

- Python 3.11+
- Node.js 18+
- pnpm (install with `npm install -g pnpm`)
- Redis (for Celery background tasks)
- uv (Python package manager - install with `curl -LsSf https://astral.sh/uv/install.sh | sh`)
- Steam account (for Workshop API access)
- SteamCMD (optional, for advanced mod management)

## Quick Start

1. **Install all dependencies**:
   ```bash
   pnpm run install:all
   ```

2. **Start the full development environment**:
   ```bash
   pnpm run dev:full
   ```

   Or start services individually:
   ```bash
   # Start backend only
   pnpm run dev:backend
   
   # Start frontend only  
   pnpm run dev:frontend
   
   # Start Redis (required for Celery)
   pnpm run dev:redis
   
   # Start Celery worker
   pnpm run dev:celery
   ```

3. **Set up environment files**:
   ```bash
   # Backend environment
   cp backend/.env.example backend/.env
   
   # Frontend environment  
   cp frontend/.env.example frontend/.env.local
   ```

4. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

## Project Structure

```
├── backend/                 # Python Flask backend
│   ├── app/                # Application code
│   │   ├── models/         # SQLAlchemy models (Mod, Collection, ServerConfig)
│   │   ├── routes/         # API routes
│   │   ├── tasks/          # Celery background tasks
│   │   ├── utils/          # Helper functions
│   │   ├── config.py       # Flask configuration
│   │   └── __init__.py     # App factory
│   ├── tests/              # Python tests
│   ├── main.py             # Application entry point
│   ├── pyproject.toml      # Python dependencies and config
│   └── .env.example        # Environment variables template
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   └── ui/         # Shadcn/UI components
│   │   ├── services/       # API service functions
│   │   ├── assets/         # Static assets
│   │   ├── App.tsx         # Main React component
│   │   └── main.tsx        # React entry point
│   ├── public/             # Public assets
│   ├── package.json        # Frontend dependencies and scripts
│   └── .env.example        # Frontend environment template
├── .github/                # GitHub workflows and configuration
├── package.json            # Root orchestration scripts
└── CLAUDE.md               # Development guidelines
```

## Available Scripts

### Root Level Scripts

- `pnpm run dev` - Start backend and frontend in development mode
- `pnpm run dev:full` - Start all services (Redis, backend, Celery, frontend)
- `pnpm run install:all` - Install dependencies for all projects
- `pnpm run build` - Build the frontend for production
- `pnpm run test` - Run tests for both frontend and backend
- `pnpm run lint` - Lint both frontend and backend code
- `pnpm run format` - Format code in both projects
- `pnpm run clean` - Clean build artifacts

### Backend Scripts (cd backend && ...)

- `uv run python main.py` - Start Flask development server
- `uv run pytest` - Run Python tests
- `uv run ruff check .` - Lint Python code
- `uv run ruff format .` - Format Python code
- `uv run mypy .` - Type check Python code

### Frontend Scripts (cd frontend && ...)

- `pnpm dev` - Start Vite development server
- `pnpm build` - Build for production
- `pnpm lint` - Lint TypeScript/React code
- `pnpm format` - Format frontend code

## Development Workflow

### Hot Reloading

- **Python**: Flask automatically reloads when Python files change
- **React**: Vite provides instant HMR for React components

### Adding New Features

1. **Implement backend** in `backend/app/routes/`
2. **Implement frontend** with shared types
3. **Test** with `pnpm run test`

### Code Quality

The project includes comprehensive linting and formatting:

- **Python**: Ruff (linting + formatting), Black (formatting), MyPy (type checking)
- **TypeScript**: ESLint (linting), Prettier (formatting)
- **Git hooks**: Consider adding pre-commit hooks for automated quality checks

## API Documentation

The backend provides REST API endpoints for managing Arma 3 servers, mods, and collections:

- **Health Check**: `GET /api/health` - Service status
- **Mods**: `GET|POST /api/mods` - Manage Steam Workshop mods
- **Collections**: `GET|POST /api/collections` - Manage mod collections
- **Server Configs**: `GET|POST /api/server-configs` - Manage server configurations

Detailed API documentation can be found in the backend code at `backend/app/routes/api.py`.

## Environment Variables

### Backend (.env)

Copy `backend/.env.example` to `backend/.env` and configure:

```bash
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
DATABASE_URI=sqlite:///app.db
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### Frontend (.env.local)

Copy `frontend/.env.example` to `frontend/.env.local` and configure:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_NODE_ENV=development
```

## Database Management

The backend uses SQLAlchemy with SQLite by default. To work with the database:

```bash
cd backend

# Create database tables (run once during setup)
uv run python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"

# Access Flask shell with database context
uv run flask shell
```

## Deployment

### Frontend

```bash
cd frontend
pnpm build
# Deploy contents of dist/ directory
```

### Backend

```bash
cd backend
# Set production environment variables
export FLASK_ENV=production
export SECRET_KEY=your-production-secret-key

# Install production dependencies
uv sync --no-dev
```

## Troubleshooting

### Common Issues

1. **Redis not running**: Start Redis with `pnpm run dev:redis`
2. **Database not initialized**: Run the database setup command in backend directory
3. **Port conflicts**: Default ports are 5000 (backend), 5173 (frontend), 6379 (Redis)
4. **Import errors**: Ensure all dependencies are installed with `pnpm run install:all`
5. **Steam API errors**: Verify STEAM_API_KEY is set in backend/.env

### Verification Steps

1. Check health endpoint: `curl http://localhost:5000/api/health`
2. Verify frontend loads: Open http://localhost:5173
3. Test API integration: Try creating a mod or server config through the frontend
4. Check Celery: Look for worker logs when running background tasks
5. Verify database: Check that SQLite database file exists in backend directory

## Contributing

1. Follow the existing code style and conventions
2. Add type hints to all Python functions
3. Use pydoc format for Python documentation
4. Ensure all linting passes before committing
5. Add tests for new features

## License

[GNU General Public License](./LICENSE)
