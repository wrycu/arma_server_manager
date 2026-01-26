# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Application Overview

This is an Arma 3 server management application with a Flask backend and React frontend. The system manages Arma 3 server configurations, mod collections, Steam Workshop mod downloads, and server lifecycle operations.

## Development Commands

### Full Application
- `pnpm run dev` - Start all services (backend, Celery worker, frontend)
- `pnpm run install:all` - Install dependencies for all projects
- `pnpm run test` - Run tests for both backend and frontend
- `pnpm run lint` - Lint both backend and frontend
- `pnpm run format` - Format code in both projects

### Backend (Python/Flask)
- `cd backend && uv run python main.py` - Start Flask development server
- `cd backend && uv run pytest` - Run Python tests
- `cd backend && uv run ruff check . && uv run mypy .` - Lint and type check
- `cd backend && uv run ruff format . && uv run black .` - Format Python code
- `cd backend && uv run celery -A app.celery worker --loglevel=info` - Start Celery worker

### Frontend (React/TypeScript)
- `cd frontend && pnpm dev` - Start Vite development server
- `cd frontend && pnpm build` - Build for production
- `cd frontend && pnpm lint` - Lint TypeScript/React code
- `cd frontend && pnpm format` - Format frontend code

### External Services (Docker Compose)
- `docker-compose up redis` - Start Redis service for Celery (optional, SQLite default)
- `docker-compose up redis redis-commander` - Start Redis with web UI management tool
- `docker-compose down` - Stop all external services
- `docker-compose up --profile tools` - Start all services including optional tools

### Dependencies
- Backend uses `uv` for Python package management
- Frontend uses `pnpm` for Node.js packages
- SQLite is used by default for both application data and Celery background tasks
- Redis can optionally be used for Celery via docker-compose

## Architecture Overview

### Backend Architecture
- **Flask** application with SQLAlchemy ORM using SQLite database
- **Celery** for background tasks (mod downloads, server operations) - supports SQLite or Redis broker
- **Models**: Core entities are `Mod`, `Collection`, `ModCollectionEntry`, `ServerConfig`
- **API Routes**: RESTful API in `app/routes/api.py`
- **Background Tasks**: Celery tasks in `app/tasks/background.py`

### Key Domain Concepts
- **Mods**: Arma 3 mods with Steam Workshop integration, can be server-side only or client mods
- **Collections**: Groups of mods that can be applied to server configurations
- **Server Configurations**: Complete Arma 3 server setups with mod lists, passwords, player limits
- **Mod Types**: Enumerated as `mod`, `mission`, or `map`

### Frontend Architecture
- **React** with TypeScript and Vite build system
- **Tailwind CSS** with **Shadcn/UI** components
- **Axios** for API communication with interceptors for auth and error handling
- **React Query** (TanStack Query) for data fetching and caching

### Data Flow
- Frontend calls REST API endpoints defined in `frontend/src/services/api.ts`
- Backend models use `to_dict()` methods for JSON serialization
- Sensitive data (passwords) excluded from API responses unless explicitly requested
- Background tasks handle Steam Workshop downloads and server management

### Environment Configuration
- Backend: Uses `.env` file for Flask configuration, database URI, Celery broker
- Frontend: Uses `.env.local` for Vite environment variables (API base URL)
- Default ports: Backend (5000), Frontend (5173), Redis (6379), Redis Commander (8081)
- Celery can use SQLite (default) or Redis (via docker-compose) - see `backend/.env.example`

### Code Quality Standards
- **Python**: Type hints required, Ruff formatting (88 char line length), MyPy type checking, Pydoc docstrings
- **TypeScript**: ESLint + Prettier, strict TypeScript configuration
- **Database**: SQLAlchemy 2.0 with mapped columns and type annotations

## Development Guidelines
- All development commands must support unix or windows. We have multiple developers and they both use a different OS.

## Type Safety Principles
- Static typing is not optional. Make invalid types unrepresentable by making clear descriptive types for both frontend and backend.

## Testing Philosophy
- A test that does nothing is worse than no test at all. All tests must be meaningful and have purpose.

## Code Philosophy
- Prioritize ease of maintainability and simple developer experience in all changes. Only introduce complexity when you absolutely have to and it is solving a problem.