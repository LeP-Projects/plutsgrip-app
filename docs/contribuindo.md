# Contributing to PlutusGrip

Thank you for interest in contributing to PlutusGrip! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

### Be Respectful
- Treat all contributors with respect
- Be open to different opinions
- Resolve conflicts constructively

### Be Inclusive
- Welcome new contributors
- Provide helpful feedback
- Mentor when possible

### Be Professional
- Use clear, professional communication
- Avoid offensive language
- Focus on the code, not the person

---

## Getting Started

### 1. Fork the Repository

```bash
# Go to GitHub and fork the repository
# Or via CLI:
gh repo fork <repository-url>
```

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/LeP-Projects.git
cd "LeP Projects"
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/LeP-Projects.git
```

### 4. Create Development Branch

```bash
git checkout -b feature/your-feature-name
```

### 5. Setup Development Environment

```bash
# See SETUP.md for detailed instructions
make up              # Start development environment
make build           # Build Docker images if needed
```

---

## Development Process

### 1. Understand the Structure

- **Backend**: `plutsgrip-api/` - FastAPI REST API
- **Frontend**: `plutsgrip-frond-refac/` - React TypeScript application
- **Documentation**: `docs/` - Centralized documentation
- **Docker**: Root-level orchestration

See [docs/02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md) for detailed architecture.

### 2. Choose Your Area

#### Backend Development
```bash
cd plutsgrip-api

# View backend documentation
cat README.md
cat docs/ARCHITECTURE.md

# Run backend tests
pytest

# Access API shell
make shell
```

#### Frontend Development
```bash
cd plutsgrip-frond-refac

# View frontend documentation
cat README.md
cat docs/ARCHITECTURE.md

# Run frontend tests
npm test

# Start dev server
npm run dev
```

### 3. Create Feature Branch

```bash
# Backend feature
git checkout -b feature/backend/your-feature

# Frontend feature
git checkout -b feature/frontend/your-feature

# Bug fix
git checkout -b bugfix/issue-description

# Documentation
git checkout -b docs/update-description
```

### 4. Make Your Changes

Follow the coding standards for your area:
- [Backend Standards](#backend-coding-standards)
- [Frontend Standards](#frontend-coding-standards)

### 5. Test Your Changes

#### Backend
```bash
# Run all tests
pytest

# Run specific test
pytest tests/test_auth.py -v

# Check code quality
make lint
make format
```

#### Frontend
```bash
# Run all tests
npm test

# Run with coverage
npm test:coverage

# Check types
npm run lint
```

---

## Coding Standards

### Backend Coding Standards

#### Python Style Guide
- Follow **PEP 8** guidelines
- Use **4 spaces** for indentation
- Maximum line length: **100 characters**
- Use **type hints** for all functions

#### Example:
```python
# ✓ Good
async def create_user(
    user_data: UserCreate,
    db: AsyncSession
) -> User:
    """Create a new user with validation."""
    # Implementation
    pass

# ✗ Bad
async def create_user(user_data, db):
    # Implementation
    pass
```

#### File Organization
```
plutsgrip-api/
├── app/
│   ├── api/v1/
│   │   ├── endpoints/    # API routes (one file per resource)
│   │   └── router.py     # Route aggregation
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas (request/response)
│   ├── services/         # Business logic
│   ├── repositories/     # Data access
│   ├── core/            # Config, security, database
│   └── middlewares/     # Custom middleware
├── tests/               # Test files mirror app structure
└── alembic/            # Database migrations
```

#### Naming Conventions
```python
# Functions and variables: snake_case
def create_user(): pass
user_email = "user@example.com"

# Classes: PascalCase
class UserService: pass
class CreateUserRequest: pass

# Constants: UPPER_SNAKE_CASE
MAX_RETRIES = 3
DATABASE_URL = "postgresql://..."

# Private methods: prefix with _
def _hash_password(password: str) -> str: pass
```

### Frontend Coding Standards

#### TypeScript Style Guide
- Use **2 spaces** for indentation
- Use **TypeScript strict mode**
- Always provide **explicit types**
- Use **functional components** with hooks

#### Example:
```typescript
// ✓ Good
interface UserFormProps {
  onSubmit: (user: UserData) => Promise<void>;
  isLoading?: boolean;
}

export function UserForm({ onSubmit, isLoading = false }: UserFormProps) {
  // Implementation
}

// ✗ Bad
export function UserForm({ onSubmit, isLoading }) {
  // Missing types
}
```

#### File Organization
```
plutsgrip-frond-refac/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API services
│   ├── contexts/       # React contexts
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── styles/         # Global styles
├── docs/               # Feature-specific documentation
└── tests/              # Test files mirror structure
```

#### Naming Conventions
```typescript
// Components: PascalCase
function UserProfile() { }
export const UserForm = () => { }

// Hooks: camelCase with 'use' prefix
function useAuth() { }
function useFetch(url: string) { }

// Variables/functions: camelCase
const userName = "John"
const getUser = async (id: string) => { }

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = "http://localhost:8000"
const MAX_RETRIES = 3

// Types/Interfaces: PascalCase
interface User { }
type UserStatus = 'active' | 'inactive'
```

---

## Testing

### Backend Testing

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_auth.py

# Run with verbose output
pytest -v

# Run with coverage report
pytest --cov

# Run tests matching pattern
pytest -k "test_login"
```

#### Test Structure
```python
# tests/test_auth.py

import pytest
from app.services.auth_service import AuthService

@pytest.fixture
def auth_service():
    """Fixture for auth service."""
    return AuthService()

class TestUserRegistration:
    """Test cases for user registration."""

    @pytest.mark.asyncio
    async def test_register_user_success(self, auth_service):
        """Test successful user registration."""
        result = await auth_service.register(
            email="test@example.com",
            password="SecurePass123!"
        )
        assert result.email == "test@example.com"

    @pytest.mark.asyncio
    async def test_register_user_invalid_email(self, auth_service):
        """Test registration with invalid email."""
        with pytest.raises(ValidationError):
            await auth_service.register(
                email="invalid",
                password="SecurePass123!"
            )
```

### Frontend Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test UserForm.test.tsx

# Run with coverage
npm test:coverage

# Run in watch mode
npm test -- --watch

# E2E testing
npx playwright test
```

#### Test Structure
```typescript
// src/components/__tests__/UserForm.test.tsx

import { render, screen, fireEvent } from '@testing-library/react'
import { UserForm } from '../UserForm'

describe('UserForm', () => {
  test('renders form with email input', () => {
    render(<UserForm onSubmit={jest.fn()} />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  test('submits form with valid data', async () => {
    const handleSubmit = jest.fn()
    render(<UserForm onSubmit={handleSubmit} />)

    const submitButton = screen.getByRole('button', { name: 'Submit' })
    fireEvent.click(submitButton)

    expect(handleSubmit).toHaveBeenCalled()
  })
})
```

---

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, semicolons, etc)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Build process, dependencies, tools

### Scope
- `auth` - Authentication system
- `api` - API endpoints
- `db` - Database/migrations
- `frontend` - Frontend code
- `docker` - Docker configuration
- `docs` - Documentation

### Examples

```bash
# Good commits
git commit -m "feat(auth): add JWT token refresh endpoint"
git commit -m "fix(transactions): resolve duplicate transaction creation bug"
git commit -m "docs(setup): update installation instructions"
git commit -m "test(auth): add test coverage for password validation"
git commit -m "refactor(api): simplify error handling middleware"

# Bad commits
git commit -m "update code"
git commit -m "fix bug"
git commit -m "WIP: stuff"
git commit -m "asdf"
```

### Writing Good Commit Messages

```
feat(transactions): add export to CSV functionality

- Added CSV export endpoint to transactions API
- Implemented DataExportService with template engine
- Added unit tests for export functionality
- Updated API documentation

Closes #123
```

---

## Pull Request Process

### 1. Update Your Branch

```bash
# Fetch latest changes
git fetch upstream

# Rebase on main branch
git rebase upstream/main

# If conflicts, resolve them
git add .
git rebase --continue
```

### 2. Push Your Branch

```bash
git push origin feature/your-feature-name
```

### 3. Create Pull Request

**Via GitHub:**
1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your feature branch
4. Fill in the PR template

**Via CLI:**
```bash
gh pr create --title "Your PR Title" --body "Description"
```

### 4. PR Title Format

```
<type>: <description>

# Examples
feat: Add budget notification system
fix: Resolve CORS issues in production
docs: Update API documentation
```

### 5. PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added
- [ ] Manual testing completed
- [ ] No test coverage lost

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated

## Related Issues
Closes #issue_number
```

### 6. Respond to Feedback

- Respond to review comments
- Push new commits to address feedback
- Re-request review when ready

### 7. Merge

Once approved:
```bash
# Squash and merge (recommended for small PRs)
git merge --squash feature/your-feature-name

# Or regular merge
git merge feature/your-feature-name

# Push to main
git push upstream main
```

---

## Reporting Bugs

### Bug Report Template

```markdown
## Description
Clear description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
If applicable, add screenshots

## Environment
- OS: [Windows/macOS/Linux]
- Browser: [Chrome/Firefox/Safari]
- Docker version: X.X.X
- Python/Node version: X.X.X
```

---

## Feature Requests

### Feature Request Template

```markdown
## Description
Clear description of the feature

## Motivation
Why is this feature needed?

## Proposed Solution
How should it work?

## Alternatives
Are there alternative approaches?

## Additional Context
Any additional information
```

---

## Questions?

- Check [docs/FAQ.md](docs/FAQ.md) for common questions
- Review [docs/07-DEVELOPMENT.md](docs/07-DEVELOPMENT.md) for dev details
- Check existing GitHub issues
- Open a discussion

---

## Thank You!

Thanks for contributing to PlutusGrip! Your efforts help make personal finance management better for everyone. 🎉
