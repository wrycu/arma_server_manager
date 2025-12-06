Analyze the current changes and provide a comprehensive review focusing on minimization, simplification, and code quality improvements.

## Analysis Objectives

Perform a thorough analysis of the current changes to:
1. **Minimize the changeset** - identify what's truly necessary
2. **Simplify the implementation** - reduce complexity
3. **Improve pluggability** - enhance modularity and reusability
4. **Ensure code quality** - maintain high standards

## 1. Minimal Changeset Analysis

### Identify and Flag for Removal:
- **Debugging artifacts**:
  - `console.log()`, `console.error()`, `console.warn()`
  - `debugger` statements
  - Temporary print statements or logging
  - Test data or mock values left in production code

- **Dead code**:
  - Commented-out code blocks
  - Unused imports
  - Unused variables or functions
  - Unreachable code paths

- **Experimental changes**:
  - Multiple attempted solutions (keep only the working one)
  - Temporary workarounds that are no longer needed
  - Feature flags or toggles that aren't needed yet

- **Formatting-only changes**:
  - Whitespace changes unrelated to the feature
  - Import reordering (unless it's a linting requirement)
  - Comment formatting

### What to Keep:
- Core feature implementation
- Bug fixes
- Necessary refactoring that supports the feature
- New dependencies actually used
- Documentation updates
- Test coverage

**Output**: A clear list of lines/blocks that can be safely removed while preserving functionality.

---

## 2. Simplification Opportunities

### Code Complexity
Identify and suggest simplifications for:

- **Overly complex functions**:
  - Functions > 30 lines (consider splitting)
  - Deep nesting (> 3 levels)
  - Too many parameters (> 4)
  - Multiple responsibilities

- **Redundant logic**:
  - Repeated code blocks → extract to helper function
  - Similar conditional logic → consolidate
  - Duplicated type definitions → create shared types

- **Verbose implementations**:
  - Long chains that could use intermediate variables
  - Explicit loops that could be array methods
  - Manual type checking that TypeScript can handle

### Suggest Extractions

For **backend (Python)**:
- Extract complex logic to `backend/app/utils/helpers.py`
- Create reusable helper functions with clear names
- Move validation logic to dedicated functions

For **frontend (TypeScript)**:
- Extract helpers to `frontend/src/lib/helpers/`
- Create custom hooks in `frontend/src/hooks/` for stateful logic
- Extract types to `frontend/src/types/`

### Pattern Improvements
- Replace anti-patterns with idiomatic code
- Suggest more readable alternatives
- Identify opportunities for modern syntax (optional chaining, nullish coalescing, etc.)

**Output**: Specific refactoring suggestions with before/after examples.

---

## 3. Pluggable Architecture Improvements

### Modularity Assessment

**Identify tight coupling**:
- Hardcoded values that should be configurable
- Direct dependencies that could be injected
- Components/functions that do too much
- Business logic mixed with UI/presentation

**Suggest decoupling**:
- **Props/parameters**: Pass dependencies explicitly
- **Configuration**: Move magic numbers/strings to constants
- **Interfaces**: Define clear contracts between modules
- **Dependency injection**: Pass services/helpers as parameters

### Reusability Opportunities

**Components/Functions that could be extracted**:
- Repeated UI patterns → new Shadcn-based component
- Common data transformations → helper function
- Shared business logic → service/utility module

**Generic implementations**:
- Specific code that could be made more generic
- Hard-coded types that could be generic
- Component props that could accept more variations

### Separation of Concerns

Check for violations and suggest fixes:
- **UI components** should focus on presentation
- **Hooks** should handle stateful logic
- **Helpers** should contain pure utility functions
- **API routes** should delegate to service layer
- **Models** should focus on data structure

**Project-specific patterns**:
- Collections logic belongs in collection-related files
- Mod management in mod helpers/services
- Server operations in server helpers
- Steam integration in Steam-specific modules

**Output**: Architectural improvements with clear separation and better modularity.

---

## 4. Code Quality Checks

### Type Safety (TypeScript/Python)
- Missing type annotations
- Use of `any` or overly broad types
- Inconsistent typing patterns
- Missing return types

### Naming Conventions
- Unclear or misleading names
- Inconsistent naming (camelCase vs snake_case)
- Overly abbreviated names
- Better semantic alternatives

### Error Handling
- Missing error handling
- Silent failures
- Generic error messages
- Unhandled edge cases

### Testing Gaps
- Uncovered code paths
- Missing test cases for new features
- Complex logic without tests

### Documentation
- Missing JSDoc/docstrings for complex functions
- Outdated comments
- Unclear component props documentation

**Output**: List of quality issues with severity and suggested fixes.

---

## Final Report Structure

Provide the analysis in this format:

### 🗑️ Can Be Removed (Minimal Changeset)
- Line X-Y: Debug console.log statements
- Line Z: Commented-out code from experimentation
- Import ABC: Unused import

### 🔧 Should Be Simplified
- Function `foo()`: Too complex, suggest splitting into `fooA()` and `fooB()`
- Lines X-Y: Repeated logic, extract to helper `calculateTotal()`

### 🔌 Architectural Improvements (Pluggability)
- Extract hardcoded value to constant/config
- Component `XYZ` mixing concerns, suggest splitting into container/presentation
- Create shared type for repeated interface

### ⚠️ Code Quality Issues
- Missing type annotation on function `bar()`
- Error handling needed in async function
- Consider adding tests for new feature

### ✅ Core Changes (Keep As-Is)
- Lines X-Y: Essential feature implementation
- New component: Required for the feature
- API endpoint: Necessary for data fetching

### 💡 Recommendations Summary
1. Remove X lines of debugging code
2. Extract Y duplicated logic blocks to helpers
3. Split component Z for better separation of concerns
4. Add type annotations to N functions

Provide specific line numbers or code snippets where helpful. Be thorough but pragmatic - focus on high-impact improvements.

