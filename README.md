# Arma 3 Server Manager

A modern web application for managing Arma 3 dedicated servers with mod collections and Steam Workshop integration.

![License](https://img.shields.io/badge/license-GPL-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-blue.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)

## Features

- **Server Management**: Create and configure multiple Arma 3 server instances
- **Mod Collections**: Organize and manage Steam Workshop mods in collections
- **Steam Workshop Integration**: Automatic mod downloading and updates
- **Background Processing**: Async task handling with Celery
- **Modern Stack**: Flask + React with TypeScript and Tailwind CSS

## Quick Start

1. **Install dependencies**:
   ```bash
   pnpm run install:all
   ```

2. **Set up environment**:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

3. **Start development environment**:
   ```bash
   pnpm run dev:full
   ```

4. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Project Structure

```
├── backend/           # Flask API server
├── frontend/          # React TypeScript app
├── .github/           # CI/CD workflows
└── docs/              # Additional documentation
```

## Documentation

- [Backend Documentation](./backend/README.md) - Flask API, database, and task management
- [Frontend Documentation](./frontend/README.md) - React components and UI architecture
- [Contributing Guide](./CONTRIBUTING.md) - Development workflow and guidelines

## Development Commands

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start backend and frontend |
| `pnpm run dev:full` | Start all services including Redis and Celery |
| `pnpm run test` | Run all tests |
| `pnpm run lint` | Lint all code |
| `pnpm run format` | Format all code |

## Production Deployment

### Wheel Distribution

Build a Python wheel package that users can install with `uv` or `pip`:

1. **Build the wheel**:
   ```bash
   pnpm run build:wheel
   ```

2. **Distribute the wheel**:
   - The wheel will be in `backend/dist/arma_server_manager-*.whl`
   - Users install with: `uv pip install arma_server_manager-*.whl`
   - Or: `pip install arma_server_manager-*.whl`

3. **Users run the application**:
   ```bash
   # Single command runs both web server and Celery worker
   arma-server-manager
   ```
   
   The application automatically starts both the Flask web server (with Gunicorn) and the Celery background worker in separate processes.

**Requirements for end users**:
- Python 3.11+ (or `uv` which installs Python automatically)
- SteamCMD (for mod management)
- Arma 3 Dedicated Server (for server management)

**Advantages**:
- Simple build process using `uv build`
- Standard Python distribution format
- Easy updates (just reinstall the wheel)
- Small package size (~10-20 MB)

### Production Server Deployment

For deploying on a server with Python already installed:

1. **Build the production bundle**:
   ```bash
   pnpm run build:wheel
   ```

2. **Configure environment**:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with production settings
   ```

3. **Start the production server**:
   
   **Option A - Using the wheel package (recommended):**
   ```bash
   # Single command runs both server and Celery worker
   arma-server-manager
   ```
   
   **Option B - Development mode with separate processes:**
   ```bash
   # Start Celery worker (in separate terminal/process)
   cd backend && uv run celery -A app.celery worker --loglevel=info

   # Start the web server
   pnpm run start:prod
   ```

The production server uses:
- Gunicorn WSGI server for Flask
- Pre-built static frontend files served by Flask
- Celery for background task processing
- Both server and worker managed by single entry point (wheel package)

### Production Configuration

Edit `backend/.env` for production settings:

```bash
# Security
SECRET_KEY=your-random-secret-key-here

# Database (default: SQLite)
DATABASE_URI=sqlite:///app.db

# Celery (background tasks)
CELERY_BROKER_URL=redis://localhost:6379/0      # Recommended: Redis
CELERY_RESULT_BACKEND=redis://localhost:6379/1
# Or use SQLite: CELERY_BROKER_URL=sqlalchemy+sqlite:///celery.db

# Server
PORT=5000
GUNICORN_WORKERS=4
```

## Development Requirements

- Python 3.11+
- Node.js 18+
- pnpm
- uv (Python package manager)
- Redis (optional, for production Celery setup)

## Contributing

We welcome contributions! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our development process, coding standards, and how to submit pull requests.

## License

This project is licensed under the GNU General Public License - see the [LICENSE](./LICENSE) file for details.
