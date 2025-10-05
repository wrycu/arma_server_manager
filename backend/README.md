# Backend - Arma 3 Server Manager

Flask-based REST API server for managing Arma 3 server configurations, mod collections, and Steam Workshop integration.

## Architecture

### Tech Stack
- **Flask**: Web framework with SQLAlchemy ORM
- **SQLite**: Database (with PostgreSQL support)
- **Celery**: Background task processing
- **Ruff**: Code linting and formatting
- **MyPy**: Static type checking
- **pytest**: Testing framework

### Project Structure

```
backend/
├── app/
│   ├── __init__.py         # Flask app factory
│   ├── config.py           # Configuration management
│   ├── models/             # SQLAlchemy models
│   │   ├── mod.py          # Steam Workshop mod model
│   │   ├── collection.py   # Mod collection model
│   │   ├── mod.py          # Subscribed mods model
│   │   ├── mod_collection_entry.py # Many-to-many relationship
│   │   ├── mod_image.py # Image data for subscribed mods
│   │   ├── notification.py # Webhook endpoints for notifications
│   │   ├── schedule.py # Auto-run tasks
│   │   └── server_config.py # Server configuration model
│   ├── routes/
│   │   ├── api.py          # REST API endpoints
│   │   └── arma3.py        # Arma 3 specific endpoints
│   ├── tasks/
│   │   └── background.py   # Celery background tasks
│   └── utils/
│       └── helpers.py      # Utility functions
├── tests/                  # Test suite
├── main.py                 # Application entry point
└── pyproject.toml          # Dependencies and tool config
```

## Setup

### Prerequisites
- Python 3.11+
- uv (Python package manager)

### Installation

1. **Install dependencies**:
   ```bash
   cd backend
   uv sync
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Initialize database**:
   ```bash
   uv run python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
   ```

## Development

### Starting the Server

```bash
cd backend/
# Development server with hot reload
uv run python main.py

# Or using Flask CLI
uv run flask run --debug
```

The server will start on http://localhost:5000

### Background Tasks

Start the Celery worker for background tasks:

```bash
cd backend/
# Using SQLite broker
uv run celery -A app.celery worker --loglevel=info
```

### Development Commands

| Command | Description |
|---------|-------------|
| `uv run python main.py` | Start Flask development server |
| `uv run pytest` | Run test suite |
| `uv run pytest --cov` | Run tests with coverage |
| `uv run ruff check .` | Lint code |
| `uv run ruff format .` | Format code |
| `uv run flask shell` | Open Flask shell with app context |

## API Documentation

### Core API Endpoints

| Endpoint                     | Methods            | Description                      |
|------------------------------|--------------------|----------------------------------|
| `/api/health`                | GET                | Health check                     |
| `/api/async`                 | GET                | Get Celery job status            |
| `/api/schedules`             | GET                | Get all schedules                |
| `/api/schedules/results`     | GET                | Get the outcome of all schedules |
| `/api/schedule`              | POST               | Create schedules                 |
| `/api/schedule/{id}`         | GET, PATCH, DELETE | Read, update, delete schedules   |
| `/api/schedule/{id}/trigger` | POST               | Trigger a schedule immediately   |
| `/api/schedule/{id}/results` | GET                | Get the outcome of one schedule  |
| `/api/notifications`         | GET                | Get all webhooks                 |
| `/api/notification`          | POST               | Create webhooks                  |
| `/api/notification/{id}`     | GET, PATCH, DELETE | Read, update, delete webhooks    |

### Arma 3 Specific Endpoints

| Endpoint                                                        | Methods            | Description                                                                                                 |
|-----------------------------------------------------------------|--------------------|-------------------------------------------------------------------------------------------------------------|
| `/api/arma3/health`                                             | GET                | Health check for Arma 3 API                                                                                 |
| `/api/arma3/steam/collection/{id}`                              | GET                | Resolve a Steam collection to workshop item IDs. Pass `exclude_subscribed=true` to exclude subscribed mods. |
| `/api/arma3/mod/helper/{id}`                                    | GET                | Get debugging info from Steam about a mod                                                                   |
| `/api/arma3/mod/subscriptions`                                  | GET                | Get all subscribed mods                                                                                     |
| `/api/arma3/mod/subscription`                                   | POST               | Add mod subscription                                                                                        |
| `/api/arma3/mod/subscription/{id}`                              | GET, PATCH, DELETE | Read, update, delete mod subscriptions                                                                      |
| `/api/arma3/mod/subscription/{id}/image`                        | GET                | Get mod image (binary data)                                                                                 |
| `/api/arma3/mod/{id}/download`                                  | POST, DELETE       | Trigger a subscribed mod to download (or rm it)                                                             |
| `/api/arma3/mod/{id}/update`                                    | POST               | Trigger a subscribed, downloaded mod to update                                                              |
| `/api/arma3/mod/collections`                                    | GET                | Get all collections                                                                                         |
| `/api/arma3/mod/collection`                                     | POST               | Add new collection                                                                                          |
| `/api/arma3/mod/collection/{id}`                                | GET, PATCH, DELETE | Read, update, delete top-level collection info                                                              |
| `/api/arma3/mod/collection/{id}/mods`                           | PATCH              | Add mods to existing collection                                                                             |
| `/api/arma3/mod/collection/{id}/mods/{mod_id}/load/{load_slot}` | PATCH              | Update mod load order within a collection                                                                   |
| `/api/arma3/mod/collection/{id}/mods/{mod_id}`                  | PATCH              | Remove mods from existing collection                                                                        |
| `/api/arma3/mods/update`                                        | POST               | Triggers an immediate update of all mods. This stops and restarts the server, if it was running.            |
| `/api/arma3/servers`                                            | GET                | Get all server profiles                                                                                     |
| `/api/arma3/server`                                             | POST               | Add new server profile                                                                                      |
| `/api/arma3/server/start`                                       | POST               | Start the first active server profile                                                                       |
| `/api/arma3/server/stop`                                        | POST               | Stop the currently-running active server                                                                    |
| `/api/arma3/server/{id}`                                        | GET, PATCH, DELETE | Read, update, delete server profiles                                                                        |

### Request/Response Examples

#### Get Mod Details from Steam
```bash
GET /arma3/mod/helper/843577117
```
Response:
```json
{
  "results": {
    "description": "Community Base Addons for Arma 3",
    "file_size": "123456789",
    "preview_url": "https://steamcommunity.com/...",
    "tags": ["mod", "utility"],
    "time_updated": "1640995200",
    "title": "CBA_A3"
  },
  "message": "Retrieved successfully"
}
```

#### Subscribe to Mods
```bash
POST /arma3/mod/subscription
Content-Type: application/json

{
  "mods": [
    {"steam_id": "843577117"},
    {"steam_id": "450814997"}
  ]
}
```

#### Queue Mod Download
```bash
POST /arma3/mod/843577117/download
```
Response:
```json
{
  "status": "task-uuid-here",
  "message": "Downloaded queued"
}
```

#### Check Async Job Status
```bash
GET /arma3/async/task-uuid-here
```
Response:
```json
{
  "status": "SUCCESS",
  "result": "Download completed successfully"
}
```

#### Create a Collection (Core API)
```bash
POST /api/collections
Content-Type: application/json

{
  "name": "Essential Mods",
  "description": "Core mods for all servers",
  "mod_ids": [1, 2, 3]
}
```

## Database Models

### Core Models

#### Mod
Represents a Steam Workshop mod:
- `steam_id`: Steam Workshop ID
- `name`: Display name
- `type`: mod, mission, or map
- `server_side_only`: Whether clients need the mod
- `download_path`: Local storage path
- `last_updated`: Steam Workshop update timestamp

#### Collection
Groups of mods for server configurations:
- `name`: Collection name
- `description`: Optional description
- `mods`: Many-to-many relationship with Mod

#### ServerConfig
Arma 3 server configuration:
- `name`: Configuration name
- `password`: Server password (optional)
- `max_players`: Player limit
- `port`: Server port
- `collections`: Associated mod collections

### Database Operations

```python
# Example model usage in Flask shell
from app.models import Mod, Collection, ServerConfig

# Create a mod
mod = Mod(steam_id="843577117", name="CBA_A3", type="mod")
db.session.add(mod)
db.session.commit()

# Create a collection with mods
collection = Collection(name="Essential Mods")
collection.mods.append(mod)
db.session.add(collection)
db.session.commit()
```

## Background Tasks

### Celery Configuration

The backend supports both SQLite and Redis brokers for Celery:

**SQLite (Default)**:
```bash
CELERY_BROKER_URL=sqla+sqlite:///celery_broker.db
CELERY_RESULT_BACKEND=db+sqlite:///celery_results.db
```

**Redis (Production)**:
```bash
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1
```

### Available Tasks

- `download_arma3_mod`: Download Steam Workshop mod for Arma 3
- `remove_arma3_mod`: Remove downloaded Arma 3 mod files

### Task Usage Example

```python
from app.tasks.background import download_arma3_mod, remove_arma3_mod

# Queue a mod download
result = download_arma3_mod.delay(mod_id=843577117)
print(f"Task ID: {result.id}")

# Queue a mod removal
result = remove_arma3_mod.delay(mod_id=843577117)
print(f"Task ID: {result.id}")

# Check task status via API
# GET /arma3/async/{task_id}
```

## Testing

### Running Tests

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=app

# Run specific test file
uv run pytest tests/test_api.py

# Run with verbose output
uv run pytest -v
```

### Test Structure

- `tests/conftest.py`: Test fixtures and configuration
- `tests/test_api.py`: API endpoint tests
- `tests/test_models.py`: Database model tests
- `tests/test_tasks.py`: Background task tests

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-here

# Database Configuration
DATABASE_URI=sqlite:///app.db
DEV_DATABASE_URI=sqlite:///dev.db

# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Steam CMD Configuration
STEAMCMD_PATH=/path/to/steamcmd
STEAMCMD_USER=anonymous
MOD_STAGING_DIR=/path/to/staging
MOD_INSTALL_DIR=/path/to/install
```

### Production Deployment

1. **Set production environment**:
   ```bash
   export FLASK_ENV=production
   export SECRET_KEY=your-production-secret-key
   ```

2. **Install production dependencies**:
   ```bash
   uv sync --no-dev
   ```

3. **Use a production WSGI server**:
   ```bash
   uv add gunicorn
   uv run gunicorn -w 4 -b 0.0.0.0:5000 main:app
   ```

## Code Quality

### Linting and Formatting

The backend uses Ruff for both linting and formatting:

```bash
# Check for linting issues
uv run ruff check .

# Fix auto-fixable issues
uv run ruff check --fix .

# Format code
uv run ruff format .
```

### Type Checking

MyPy is used for static type checking:

```bash
# Run type checker
uv run mypy .

# Check specific file
uv run mypy app/models/mod.py
```

### Pre-commit Configuration

Add to `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.6
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.7.1
    hooks:
      - id: mypy
```

## Troubleshooting

### Common Issues

1. **Import errors**: Ensure you're in the backend directory and dependencies are installed with `uv sync`

2. **Database not found**: Run the database initialization command

3. **Celery worker not starting**: Check Redis connection or use SQLite broker

4. **Port already in use**: Flask default port 5000 might conflict with other services

5. **Steam API errors**: Verify STEAM_API_KEY is set in environment

### Debug Mode

Enable debug logging:

```bash
export LOG_LEVEL=DEBUG
uv run python main.py
```

### Database Inspection

```bash
# Open Flask shell
uv run flask shell

# Inspect database
>>> from app.models import *
>>> Mod.query.all()
>>> db.session.execute('SELECT * FROM mods').fetchall()
```