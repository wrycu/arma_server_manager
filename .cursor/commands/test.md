Generate comprehensive unit tests for the current file following this project's conventions and best practices.

## Project Testing Standards

### Backend (Python)
- Use **pytest** framework with fixtures
- Tests should be **colocated** next to the source file (e.g., `helpers.py` → `helpers.test.py`)
- Use **FlaskClient** for API endpoint testing
- Follow existing test patterns in `backend/tests/test_api.py`
- Use clear, descriptive test function names: `test_<function>_<scenario>_<expected_result>`
- Include pytest fixtures for common setup (database, test client, sample data)
- Test happy paths AND edge cases
- Keep tests simple and focused - one assertion per test when possible

### Frontend (TypeScript/React)
- Use **Vitest** with **React Testing Library**
- Tests should be **colocated** next to the component (e.g., `Button.tsx` → `Button.test.tsx`)
- Follow existing test patterns in `frontend/src/components/` and `frontend/src/hooks/`
- Test user interactions, not implementation details
- Use `screen` queries (getByRole, getByText) over querySelector
- Mock API calls using MSW or simple mock functions
- Test accessibility (ARIA roles, labels)
- Keep tests simple and clear

## Test Generation Guidelines

1. **Analyze the current file** to understand:
   - What it does (component, hook, API endpoint, helper function, etc.)
   - Key functionality that needs testing
   - Dependencies and how to mock them
   - Edge cases and error conditions

2. **Generate tests that cover**:
   - Primary functionality (happy path)
   - Edge cases (empty inputs, null values, boundary conditions)
   - Error handling (network errors, validation failures)
   - Integration points (API calls, database queries)

3. **Follow project patterns**:
   - Look at existing test files for structure and style
   - Use the same testing utilities and helpers
   - Match the project's assertion style
   - Follow naming conventions

4. **Keep tests maintainable**:
   - Clear test names that describe what's being tested
   - Minimal setup/teardown
   - No unnecessary complexity
   - Easy to understand at a glance

## Example Test Structure

### Backend (Python/Pytest)
```python
"""Tests for module_name."""

import pytest
from flask.testing import FlaskClient

def test_function_name_with_valid_input_returns_expected_result():
    """Test that function returns correct value with valid input."""
    # Arrange
    input_data = "test"
    
    # Act
    result = function_name(input_data)
    
    # Assert
    assert result == expected_value
```

### Frontend (TypeScript/Vitest)
```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  it('renders without crashing', () => {
    render(<ComponentName />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

Now, analyze the current file and generate appropriate tests following these guidelines.

