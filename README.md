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

## Requirements

- Python 3.11+
- Node.js 18+
- pnpm
- uv (Python package manager)
- Redis (optional, for production Celery setup)

## Contributing

We welcome contributions! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our development process, coding standards, and how to submit pull requests.

## License

This project is licensed under the GNU General Public License - see the [LICENSE](./LICENSE) file for details.
