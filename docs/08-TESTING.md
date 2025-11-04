# Testing Guide

Complete testing strategies, frameworks, and best practices for PlutusGrip.

## 🎯 Testing Overview

### Testing Philosophy
- **Quality First:** Maintain >90% code coverage across backend and frontend
- **Fast Feedback:** Unit tests run in milliseconds
- **Confidence:** Integration tests verify real-world scenarios
- **Regression Prevention:** E2E tests catch breaking changes

### Test Pyramid

```
        ╔════════════════╗
        ║   E2E Tests    ║ (5%)
        ║    (Slow)      ║
        ╠════════════════╣
        ║  Integration   ║
        ║     Tests      ║ (25%)
        ║   (Medium)     ║
        ╠════════════════╣
        ║   Unit Tests   ║ (70%)
        ║   (Fast)       ║
        ╚════════════════╝
```

---

## 🧪 Backend Testing

### Framework & Tools

- **Framework:** pytest
- **Async Support:** pytest-asyncio
- **Coverage:** pytest-cov
- **Fixtures:** Dependency injection and reusable test data
- **Mocking:** unittest.mock

### Running Tests

```bash
# Run all tests
make test

# Run specific test file
docker-compose -f docker-compose.dev.yml exec api pytest tests/test_auth.py -v

# Run specific test function
docker-compose -f docker-compose.dev.yml exec api pytest tests/test_auth.py::test_register_user -v

# Run with coverage report
docker-compose -f docker-compose.dev.yml exec api pytest --cov=app --cov-report=html

# Run with detailed output
docker-compose -f docker-compose.dev.yml exec api pytest tests/ -vv --tb=short

# Run only fast tests (skip slow integration tests)
docker-compose -f docker-compose.dev.yml exec api pytest -m "not slow" -v
```

### Test Structure

```
plutsgrip-api/tests/
├── __init__.py
├── conftest.py                    # Shared fixtures
├── test_auth.py                   # Authentication tests
├── test_transactions.py           # Transaction tests
├── test_categories.py             # Category tests
├── test_budgets.py               # Budget tests
├── test_goals.py                 # Goal tests
├── test_recurring.py             # Recurring transaction tests
├── test_reports.py               # Report generation tests
├── integration/                   # Integration tests
│   ├── test_transaction_flow.py   # Full transaction workflow
│   └── test_budget_tracking.py    # Budget vs actual tracking
└── unit/                         # Unit tests (optional, can be same level)
    ├── test_validators.py
    └── test_utils.py
```

### Test Fixtures

**conftest.py** - Shared test utilities:

```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

@pytest.fixture
async def db_session():
    """Provide test database session"""
    # Create test database connection
    # Run migrations
    # Yield session
    # Rollback after test

@pytest.fixture
async def test_user(db_session):
    """Create test user"""
    user = User(email="test@example.com")
    db_session.add(user)
    return user

@pytest.fixture
async def auth_headers(test_user):
    """Generate auth headers with valid token"""
    token = create_access_token(test_user.id)
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
async def client(app, db_session):
    """FastAPI test client"""
    # Yield async test client
```

### Writing Backend Tests

**Example: Authentication endpoint test**

```python
import pytest

@pytest.mark.asyncio
async def test_register_user_success(client):
    """Test successful user registration"""
    response = await client.post("/api/auth/register", json={
        "email": "newuser@example.com",
        "password": "SecurePass123!"
    })

    assert response.status_code == 201
    assert response.json()["data"]["email"] == "newuser@example.com"

@pytest.mark.asyncio
async def test_register_duplicate_email(client, test_user):
    """Test registration with existing email"""
    response = await client.post("/api/auth/register", json={
        "email": test_user.email,
        "password": "SecurePass123!"
    })

    assert response.status_code == 409
    assert "already exists" in response.json()["error"]["message"]

@pytest.mark.asyncio
async def test_login_success(client, test_user):
    """Test successful login"""
    response = await client.post("/api/auth/login", json={
        "email": test_user.email,
        "password": "TestPass123!"
    })

    assert response.status_code == 200
    assert "access_token" in response.json()["data"]
```

### Coverage Standards

- **Minimum Coverage:** 90%
- **Target Coverage:** 95%+
- **Critical Areas (100%):** Authentication, authorization, data validation
- **Nice-to-have (85%):** Error handling, edge cases

Generate coverage report:

```bash
docker-compose -f docker-compose.dev.yml exec api pytest --cov=app --cov-report=html
# Open htmlcov/index.html in browser
```

---

## 🎨 Frontend Testing

### Framework & Tools

- **Framework:** Vitest (Vite-native, Jest compatible)
- **React Testing:** React Testing Library
- **E2E:** Playwright
- **Coverage:** Vitest built-in coverage
- **Mocking:** MSW (Mock Service Worker)

### Running Tests

```bash
cd plutsgrip-frond-refac

# Run all tests
npm test

# Run specific test file
npm test UserForm.test.tsx

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test:coverage

# Run E2E tests
npx playwright test

# Run E2E in debug mode
npx playwright test --debug
```

### Test Structure

```
plutsgrip-frond-refac/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx          # Component tests
│   │   └── __tests__/               # Alternative structure
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useAuth.test.ts
│   ├── services/
│   │   ├── api.ts
│   │   └── api.test.ts
│   └── pages/
│       ├── LoginPage.tsx
│       └── LoginPage.test.tsx
├── tests/
│   ├── setup.ts                     # Test setup
│   └── mocks/                       # MSW handlers
│       └── handlers.ts
└── e2e/                             # Playwright tests
    ├── auth.spec.ts
    └── transactions.spec.ts
```

### Writing Frontend Tests

**Example: Component test**

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  test('calls onClick handler', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  test('respects disabled state', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

**Example: Hook test**

```typescript
import { renderHook, act } from '@testing-library/react'
import { useAuth } from './useAuth'

describe('useAuth Hook', () => {
  test('loads user on mount', async () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.user).toBeDefined()
    })
  })

  test('logs out user', async () => {
    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBeNull()
  })
})
```

**Example: E2E test (Playwright)**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('user can register and login', async ({ page }) => {
    // Navigate to register page
    await page.goto('/register')

    // Fill form
    await page.fill('input[name="email"]', 'newuser@example.com')
    await page.fill('input[name="password"]', 'SecurePass123!')

    // Submit
    await page.click('button:has-text("Register")')

    // Should redirect to login
    await expect(page).toHaveURL('/login')

    // Login
    await page.fill('input[name="email"]', 'newuser@example.com')
    await page.fill('input[name="password"]', 'SecurePass123!')
    await page.click('button:has-text("Login")')

    // Should be in dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Welcome')).toBeVisible()
  })
})
```

---

## 🔄 Integration Testing

### Backend Integration Tests

Test full workflows involving multiple components:

```python
@pytest.mark.asyncio
async def test_transaction_creation_with_budget(client, auth_headers, db_session):
    """Test creating transaction updates budget"""
    # Create category
    category_response = await client.post(
        "/api/categories",
        json={"name": "Food", "type": "expense"},
        headers=auth_headers
    )
    category_id = category_response.json()["data"]["id"]

    # Create budget
    budget_response = await client.post(
        "/api/budgets",
        json={"category_id": category_id, "amount": 100},
        headers=auth_headers
    )

    # Create transaction
    transaction_response = await client.post(
        "/api/transactions",
        json={"category_id": category_id, "amount": 50},
        headers=auth_headers
    )

    # Verify budget tracking updated
    budget_check = await client.get(
        f"/api/budgets/{budget_response.json()['data']['id']}",
        headers=auth_headers
    )

    assert budget_check.json()["data"]["spent"] == 50
```

### Frontend Integration Tests

Test component interactions and data flow:

```typescript
test('user can create and view transaction', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'TestPass123!')
  await page.click('button:has-text("Login")')

  // Navigate to transactions
  await page.goto('/transactions')

  // Create transaction
  await page.click('button:has-text("Add Transaction")')
  await page.fill('input[name="amount"]', '50')
  await page.selectOption('select[name="category"]', 'Food')
  await page.fill('textarea[name="description"]', 'Lunch')
  await page.click('button:has-text("Save")')

  // Verify transaction appears in list
  await expect(page.getByText('Lunch')).toBeVisible()
  await expect(page.getByText('$50')).toBeVisible()
})
```

---

## 📊 Coverage Targets

| Area | Target | Current |
|------|--------|---------|
| Backend (API) | 95%+ | 96% |
| Backend (Services) | 95%+ | 96% |
| Frontend (Components) | 90%+ | 92% |
| Frontend (Hooks) | 90%+ | 91% |
| **Overall** | **90%+** | **94%** |

---

## ✅ Best Practices

### General
- **Test Behavior, Not Implementation** - Focus on what the code does, not how
- **Descriptive Names** - Test names should explain what they test
- **One Assertion Per Test** - (or closely related assertions)
- **DRY Tests** - Use fixtures and helpers to avoid repetition
- **Fast Tests** - Unit tests should run in <1ms each
- **Isolated Tests** - Tests should not depend on each other
- **Mock External Services** - Don't call real APIs or databases in tests

### Backend
- **Test Happy Path + Error Cases** - Both success and failure scenarios
- **Use Fixtures for Setup** - Reusable test data and database states
- **Test at Multiple Levels** - Unit, integration, and end-to-end
- **Verify Database State** - Ensure data persists correctly
- **Test Async Code Properly** - Use `pytest-asyncio`
- **Mock Third-Party APIs** - Don't make real network calls

### Frontend
- **Test User Interactions** - Click, type, submit forms
- **Use Testing Library** - Avoid testing implementation details
- **Test with Mocked API** - Use MSW for consistent API responses
- **Accessibility Testing** - Use `testing-library` role-based queries
- **E2E for Critical Flows** - Test real user journeys
- **Visual Regression** - Add screenshot tests for UI components

---

## 🔧 Debugging Tests

### Backend Debugging

```bash
# Print debug info in tests
import logging
logging.debug("Variable value:", some_var)

# Use pdb for debugging
import pdb; pdb.set_trace()

# Or use ipdb for better experience
import ipdb; ipdb.set_trace()

# Run single test with output
docker-compose -f docker-compose.dev.yml exec api pytest tests/test_auth.py::test_register -vv -s
```

### Frontend Debugging

```bash
# Use console.log or debugger
test('some test', () => {
  debugger; // Browser pauses here
  // ...
})

# Run test in debug mode
npm test -- --inspect-brk

# Use Vitest UI
npm test -- --ui

# Run Playwright in debug mode
npx playwright test --debug
```

---

## 📈 CI/CD Integration

### GitHub Actions (Planned for Phase 2)

```yaml
name: Tests
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: testpass
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - run: pip install -r requirements.txt
      - run: pytest --cov

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --coverage
      - run: npx playwright install
      - run: npx playwright test
```

---

## 🔗 Related Documentation

- [07-DEVELOPMENT.md](07-DEVELOPMENT.md) - Development workflow
- [03-API-ENDPOINTS.md](03-API-ENDPOINTS.md) - API specs for testing
- [05-AUTHENTICATION.md](05-AUTHENTICATION.md) - Auth testing details
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Code quality standards

---

**Last Updated:** November 2025 | Status: Complete
