# Contributing to Arma 3 Server Manager

Thank you for your interest in contributing to the Arma 3 Server Manager! This guide will help you get started with development and ensure your contributions align with our project standards.

## Getting Started

### Prerequisites

Ensure you have the following installed:
- Python 3.11+
- Node.js 18+
- pnpm (install with `npm install -g pnpm`)
- uv (install with `curl -LsSf https://astral.sh/uv/install.sh | sh`)
- Git

### Development Setup

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/yourusername/arma_server_manager.git
   cd arma_server_manager
   ```

2. **Install all dependencies**:
   ```bash
   pnpm run install:all
   ```

3. **Set up environment files**:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

4. **Initialize the database**:
   ```bash
   cd backend
   uv run python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
   cd ..
   ```

5. **Start the development environment**:
   ```bash
   pnpm run dev
   ```

6. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Development Commands

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start backend, Celery, and frontend |
| `pnpm run test` | Run all tests |
| `pnpm run lint` | Lint all code |
| `pnpm run format` | Format all code |
| `pnpm run install:all` | Install all dependencies |

### Backend Commands

| Command | Description |
|---------|-------------|
| `cd backend && uv run python main.py` | Start Flask server |
| `cd backend && uv run pytest` | Run Python tests |
| `cd backend && uv run ruff check . && uv run mypy .` | Lint and type check |
| `cd backend && uv run ruff format .` | Format Python code |
| `cd backend && uv run celery -A app.celery worker --loglevel=info` | Start Celery worker |

### Frontend Commands

| Command | Description |
|---------|-------------|
| `cd frontend && pnpm dev` | Start Vite dev server |
| `cd frontend && pnpm build` | Build for production |
| `cd frontend && pnpm lint` | Lint TypeScript/React |
| `cd frontend && pnpm format` | Format frontend code |

## Architecture Overview

### Backend
- **Flask** application with SQLAlchemy ORM using SQLite database
- **Celery** for background tasks (mod downloads, server operations)
- **Models**: Core entities are `Mod`, `Collection`, `ModCollectionEntry`, `ServerConfig`
- **API Routes**: RESTful API in `app/routes/api.py`
- **Background Tasks**: Celery tasks in `app/tasks/background.py`

### Frontend
- **React** with TypeScript and Vite build system
- **Tailwind CSS** with **Shadcn/UI** components
- **Axios** for API communication
- **React Query** for data fetching and caching

### Key Concepts
- **Mods**: Arma 3 mods with Steam Workshop integration
- **Collections**: Groups of mods that can be applied to server configurations
- **Server Configurations**: Complete Arma 3 server setups with mod lists

### Environment Configuration
- Backend: Uses `.env` file (see `backend/.env.example`)
- Frontend: Uses `.env.local` file (see `frontend/.env.example`)
- Default ports: Backend (5000), Frontend (5173), Redis (6379)
- Celery can use SQLite (default) or Redis via docker-compose

## Development Workflow

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Test your changes**:
   ```bash
   pnpm run test
   pnpm run lint
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and create a pull request**:
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Style Requirements

### Python (Backend)

**Type Safety**:
- Type hints are **required** for all function parameters and return values
- Use modern Python type annotations (e.g., `list[str]` instead of `List[str]`)
- Make invalid types unrepresentable through clear, descriptive type definitions

**Code Quality**:
```bash
# Linting and formatting
uv run ruff check .          # Check for issues
uv run ruff check --fix .    # Fix auto-fixable issues
uv run ruff format .         # Format code

# Type checking
uv run mypy .               # Static type analysis
```

**Documentation**:
- Use pydoc format for docstrings
- Document all public functions and classes
- Include parameter types and return value descriptions

**Example**:
```python
def create_mod_collection(
    name: str,
    mod_ids: list[int],
    description: str | None = None
) -> Collection:
    """Create a new mod collection with specified mods.
    
    Args:
        name: Display name for the collection
        mod_ids: List of mod IDs to include
        description: Optional collection description
        
    Returns:
        Collection: The newly created collection instance
        
    Raises:
        ValidationError: If mod_ids contains invalid IDs
    """
    # Implementation here
```

### TypeScript (Frontend)

**Type Safety**:
- Strict TypeScript configuration is enforced
- Define clear interface types for all API data
- Use proper typing for React components and props

**Code Quality**:
```bash
# Linting and formatting
pnpm lint                   # ESLint check
pnpm lint:fix              # Fix auto-fixable issues
pnpm format                # Prettier formatting

# Type checking
pnpm type-check            # TypeScript compiler check
```

**Component Structure**:
```typescript
interface ModCardProps {
  mod: Mod;
  onSelect: (mod: Mod) => void;
  isSelected: boolean;
}

export const ModCard: React.FC<ModCardProps> = ({ 
  mod, 
  onSelect, 
  isSelected 
}) => {
  // Component implementation
};
```

### Code Quality Standards

1. **Maintainability First**: Prioritize code that is easy to read and modify
2. **Simple Solutions**: Only introduce complexity when absolutely necessary
3. **Consistent Patterns**: Follow established patterns in the codebase
4. **Cross-Platform**: Ensure all development commands work on Unix and Windows

## Testing Philosophy

> **A test that does nothing is worse than no test at all. All tests must be meaningful and have purpose.**

### Writing Good Tests

**Focus on Value**:
- Test behavior, not implementation details
- Cover edge cases and error conditions
- Ensure tests fail when they should
- Write tests that would catch real bugs

**Backend Testing**:
```python
def test_create_collection_with_invalid_mods():
    """Test that creating a collection with non-existent mod IDs raises ValidationError."""
    with pytest.raises(ValidationError) as exc_info:
        create_mod_collection("Test Collection", [999, 1000])
    
    assert "Invalid mod IDs" in str(exc_info.value)
```

**Frontend Testing**:
```typescript
test('mod card shows correct mod information', () => {
  const mockMod: Mod = {
    id: 1,
    name: 'Test Mod',
    steam_id: '123456',
    type: 'mod'
  };
  
  render(<ModCard mod={mockMod} onSelect={vi.fn()} isSelected={false} />);
  
  expect(screen.getByText('Test Mod')).toBeInTheDocument();
  expect(screen.getByText('123456')).toBeInTheDocument();
});
```

### Running Tests

```bash
# Run all tests
pnpm run test

# Backend tests only
cd backend && uv run pytest

# Frontend tests only
cd frontend && pnpm test

# With coverage
cd backend && uv run pytest --cov
```

## Commit Message Format

We follow the Conventional Commits specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no functional changes)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```bash
feat(backend): add mod collection filtering API
fix(frontend): resolve mod browser pagination issue
docs: update API documentation for server configs
test(backend): add tests for mod download validation
```

## Pull Request Process

### Before Submitting

1. **Run the full test suite**:
   ```bash
   pnpm run test
   ```

2. **Ensure code quality passes**:
   ```bash
   pnpm run lint
   pnpm run format
   ```

3. **Verify functionality**:
   ```bash
   pnpm run dev
   # Test your changes in the browser
   ```

4. **Update documentation** if you've added features or changed APIs

### Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows the project's style guidelines
- [ ] Self-review of code completed
- [ ] Code is commented where necessary
- [ ] Documentation updated as needed
```

## Troubleshooting Common Issues

### Development Environment

**Dependencies not installing**:
```bash
# Clear caches and reinstall
rm -rf frontend/node_modules frontend/pnpm-lock.yaml
rm -rf backend/.venv backend/uv.lock
pnpm run install:all
```

**Database issues**:
```bash
# Reset database
cd backend
rm -f instance/dev.db dev_celery_results.db
uv run python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
```

**Port conflicts**:
```bash
# Find processes using default ports
lsof -i :5000  # Backend
lsof -i :5173  # Frontend
lsof -i :6379  # Redis

# Kill processes if needed
kill -9 <PID>
```

### Code Quality Issues

**Linting failures**:
```bash
# Backend
cd backend
uv run ruff check --fix .
uv run ruff format .

# Frontend
cd frontend
pnpm lint:fix
pnpm format
```

**Type checking errors**:
```bash
# Backend
cd backend
uv run mypy . --show-error-codes

# Frontend
cd frontend
pnpm type-check
```

### Testing Issues

**Tests failing**:
```bash
# Run specific test file
cd backend && uv run pytest tests/test_api.py -v
cd frontend && pnpm test ModCard.test.tsx

# Debug with print statements
cd backend && uv run pytest tests/test_api.py -v -s
```

## Verification Steps

Before submitting your contribution, verify:

1. **Health Check**: `curl http://localhost:5000/api/health` returns 200
2. **Frontend Loads**: Open http://localhost:5173 successfully
3. **API Integration**: Test creating mods/collections through the UI
4. **Background Tasks**: Verify Celery tasks execute (if applicable)
5. **Database**: Confirm data persists correctly
6. **Cross-Platform**: Test commands work on both Unix and Windows (if possible)

## Getting Help

- **Documentation**: Check the [Backend README](./backend/README.md) and [Frontend README](./frontend/README.md)
- **Issues**: Search existing [GitHub Issues](https://github.com/wrycu/arma_server_manager/issues)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Building from Source

To build a distributable binary:

1. Install dependencies (`pnpm`, `pyinstaller`)
2. Build the frontend: `pnpm run build:frontend`
3. Build the binary: `pyinstaller main.spec`

The built binary will be in `dist/main/`.

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (GNU General Public License).