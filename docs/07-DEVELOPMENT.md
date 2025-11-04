# Development Guide

Guide for developing features in PlutusGrip.

## 🎯 Development Workflow

### 1. Setup Development Environment

```bash
cd "LeP Projects"
make up              # Start all services
make status          # Verify services running
```

### 2. Access Development Services

- **Frontend:** http://localhost:5173 (Vite hot-reload)
- **API:** http://localhost:8000 (FastAPI)
- **API Docs:** http://localhost:8000/docs (Swagger)
- **Database:** localhost:5432 (PostgreSQL)

### 3. Start Developing

#### Backend Development
```bash
# API logs
make logs-api

# API shell (access container)
make shell

# Run tests
make test

# Run specific test
docker-compose -f docker-compose.dev.yml exec api pytest tests/test_auth.py -v
```

#### Frontend Development
```bash
cd plutsgrip-frond-refac

# Dev server runs automatically with hot-reload
# http://localhost:5173

# Run tests
npm test

# Run with coverage
npm test:coverage
```

### 4. Make Changes

**Backend:** Code changes trigger automatic restart (hot-reload)
**Frontend:** Code changes automatically reload in browser

### 5. Test Your Changes

**Backend:**
```bash
make test               # Run all tests
make test ENV=prod      # Run with prod config
```

**Frontend:**
```bash
cd plutsgrip-frond-refac
npm test               # Run tests
npm run lint           # Check types
```

### 6. Commit & Push

See [../CONTRIBUTING.md](../CONTRIBUTING.md) for commit guidelines.

```bash
git checkout -b feature/your-feature
# Make changes
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature
```

---

## 📁 Project Structure

### Backend Structure
```
plutsgrip-api/
├── app/
│   ├── api/v1/
│   │   ├── endpoints/      # Your new endpoints
│   │   └── router.py       # Register routes here
│   ├── services/           # Business logic
│   ├── repositories/       # Data access
│   ├── schemas/            # Request/response schemas
│   ├── models/             # Database models
│   └── core/               # Config, security, database
├── tests/                  # Tests mirror app structure
└── alembic/                # Database migrations
```

### Frontend Structure
```
plutsgrip-frond-refac/
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API client
│   ├── contexts/          # React contexts
│   ├── types/             # TypeScript types
│   └── utils/             # Helper functions
└── tests/                 # Test files
```

---

## 🔄 Git Workflow

### Create Feature Branch
```bash
# Backend feature
git checkout -b feature/backend/your-feature

# Frontend feature
git checkout -b feature/frontend/your-feature

# Bug fix
git checkout -b bugfix/issue-description
```

### Commit Guidelines
```bash
# Good commits
git commit -m "feat(auth): add password reset endpoint"
git commit -m "fix(transactions): resolve duplicate entry bug"
git commit -m "docs(api): update endpoint documentation"

# See CONTRIBUTING.md for detailed guidelines
```

### Push & Create Pull Request
```bash
git push origin feature/your-feature

# Create PR on GitHub
# Fill in PR template with description and testing notes
```

---

## 🔐 Authentication Development

To test authenticated endpoints:

```bash
# Get token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}'

# Use token in requests
curl -H "Authorization: Bearer TOKEN" http://localhost:8000/api/auth/me
```

---

## 💾 Database Development

### Run Migrations
```bash
# Apply pending migrations
make migrate-upgrade

# Create new migration (after modifying models)
make migrate-create NAME="your migration name"

# Rollback
make migrate-downgrade
```

### Database Access
```bash
# Access database shell
make shell-db

# Inside container:
psql -U plutusgrip_user -d plutusgrip_db

# Example queries
SELECT * FROM users;
SELECT * FROM transactions WHERE user_id = 1;
```

### Reset Database (Dev Only)
```bash
# WARNING: Deletes all data!
make clean
make up
```

---

## 🧪 Testing

### Backend Testing
```bash
# Run all tests
make test

# Run specific test file
docker-compose -f docker-compose.dev.yml exec api pytest tests/test_auth.py -v

# Run with coverage
docker-compose -f docker-compose.dev.yml exec api pytest --cov

# Run specific test function
docker-compose -f docker-compose.dev.yml exec api pytest tests/test_auth.py::test_register_user -v
```

### Frontend Testing
```bash
cd plutsgrip-frond-refac

# Run all tests
npm test

# Run specific test
npm test -- UserForm.test.tsx

# Run with coverage
npm test:coverage

# E2E testing
npx playwright test
```

### Testing Best Practices
- Write tests for new features
- Maintain 90%+ coverage
- Test happy path and error cases
- Use descriptive test names

---

## 🐛 Debugging

### Backend Debugging
```bash
# View detailed API logs
make logs-api

# Access API container shell
make shell

# Add breakpoint in Python (for debugging)
# In code:
import pdb; pdb.set_trace()
```

### Frontend Debugging
```bash
# Browser DevTools (F12)
- Elements, Console, Sources, Network, etc.

# React Developer Tools extension
# Vue/React plugins in browser

# Add debugger statement
// In code:
debugger;

# Then use browser DevTools Sources tab
```

### Database Debugging
```bash
# Access database
make shell-db

# Run slow query analysis
EXPLAIN ANALYZE SELECT * FROM transactions WHERE user_id = 1;
```

---

## 🚀 Adding New Features

### Adding Backend Endpoint

1. **Create schema** (`app/schemas/`)
   ```python
   class CreateTransactionRequest(BaseModel):
       description: str
       amount: Decimal
       category_id: int
   ```

2. **Add database model** (`app/models/`)
   - Or update existing model

3. **Create migration** (if needed)
   ```bash
   make migrate-create
   ```

4. **Implement service** (`app/services/`)
   ```python
   async def create_transaction(user_id: int, data: CreateTransactionRequest):
       # Business logic
       pass
   ```

5. **Implement repository** (`app/repositories/`)
   ```python
   async def create(self, obj_in: dict):
       # Database operation
       pass
   ```

6. **Add endpoint** (`app/api/v1/endpoints/`)
   ```python
   @router.post("/transactions")
   async def create_transaction(
       data: CreateTransactionRequest,
       user: User = Depends(get_current_user)
   ):
       # Endpoint logic
       pass
   ```

7. **Register route** (`app/api/v1/router.py`)
   ```python
   app.include_router(transactions.router)
   ```

8. **Write tests** (`tests/`)
   ```python
   async def test_create_transaction():
       # Test implementation
       pass
   ```

### Adding Frontend Component

1. **Create component** (`src/components/`)
   ```typescript
   interface TransactionFormProps {
       onSubmit: (data: TransactionData) => Promise<void>
   }

   export function TransactionForm({ onSubmit }: TransactionFormProps) {
       // Component logic
   }
   ```

2. **Create page** (if needed) (`src/pages/`)
   - Or add to existing page

3. **Create hook** (if needed) (`src/hooks/`)
   - For data fetching or logic

4. **Add to router** (`src/App.tsx`)
   ```typescript
   <Route path="/transactions" element={<TransactionPage />} />
   ```

5. **Write tests** (`src/components/__tests__/`)
   ```typescript
   test('renders TransactionForm', () => {
       render(<TransactionForm onSubmit={jest.fn()} />)
       // Assertions
   })
   ```

---

## 📝 Code Style

### Backend Style
- Follow PEP 8
- Type hints on all functions
- Max line length: 100 characters
- Run formatter: `make format`

### Frontend Style
- Use TypeScript strict mode
- Explicit types on all functions
- 2 spaces indentation
- Run linter: `npm run lint`

---

## 🔗 Useful Links

- [Contributing Guide](../CONTRIBUTING.md)
- [Architecture](02-ARCHITECTURE.md)
- [API Endpoints](03-API-ENDPOINTS.md)
- [Database Schema](04-DATABASE.md)
- [Authentication](05-AUTHENTICATION.md)

---

## 💡 Tips

- **Use IDE extensions:** ESLint, Prettier, Python extension
- **Hot-reload:** Changes auto-reload in dev
- **Debug prints:** Use `print()` for backend, `console.log()` for frontend
- **Test early:** Write tests while developing
- **Commit often:** Small commits are easier to review
- **Update docs:** Keep documentation up-to-date

---

**Last Updated:** November 2025 | Status: Complete
