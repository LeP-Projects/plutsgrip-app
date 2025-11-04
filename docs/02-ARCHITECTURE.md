# System Architecture - PlutusGrip

Complete overview of PlutusGrip system architecture, components, and data flow.

## 🏗️ High-Level Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────┐
│         Frontend Layer (React)               │
│  - Components, Pages, Hooks, Services       │
└────────────────┬────────────────────────────┘
                 │ HTTP/REST + WebSocket
┌────────────────▼────────────────────────────┐
│      API Gateway (Nginx - Production)        │
│  - Reverse proxy, Load balancing, SSL       │
└────────────────┬────────────────────────────┘
                 │ HTTP
┌────────────────▼────────────────────────────┐
│      API Layer (FastAPI)                     │
│  - Routes, Endpoints, Validation             │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│      Business Logic Layer                    │
│  - Services, Repositories, Domain Logic     │
└────────────────┬────────────────────────────┘
                 │ SQL Queries
┌────────────────▼────────────────────────────┐
│      Database Layer (PostgreSQL)             │
│  - Tables, Indexes, Constraints              │
└─────────────────────────────────────────────┘
```

---

## 📦 Component Structure

### Backend Components

#### 1. **API Layer** (`app/api/`)
- **Router** (`v1/router.py`) - Aggregates all routes
- **Endpoints** (`v1/endpoints/`) - 35+ specific endpoints
  - `auth.py` - Authentication (6 endpoints)
  - `transactions.py` - Transactions (7 endpoints)
  - `categories.py` - Categories (4 endpoints)
  - `budgets.py` - Budgets (5 endpoints)
  - `goals.py` - Goals (5 endpoints)
  - `recurring_transactions.py` - Recurring (3 endpoints)
  - `reports.py` - Reports (5 endpoints)

**Technologies:** FastAPI, Pydantic, Python type hints

#### 2. **Services Layer** (`app/services/`)
- **AuthService** - User authentication logic
- **TransactionService** - Transaction business logic
- **BudgetService** - Budget calculations
- **ReportService** - Analytics and reporting
- **CategoryService** - Category management

**Responsibilities:**
- Business logic
- Data validation
- Complex calculations
- Third-party integrations

#### 3. **Repository Layer** (`app/repositories/`)
- **UserRepository** - User data access
- **TransactionRepository** - Transaction CRUD
- **CategoryRepository** - Category CRUD
- **BudgetRepository** - Budget CRUD
- **GoalRepository** - Goal CRUD
- **RecurringTransactionRepository** - Recurring CRUD

**Responsibilities:**
- Database queries
- Data filtering and sorting
- Query optimization
- Relationship handling

#### 4. **Models Layer** (`app/models/`)
- **User** - User account data
- **Transaction** - Transaction records
- **Category** - Transaction categories
- **Budget** - Budget definitions
- **Goal** - Financial goals
- **RecurringTransaction** - Recurring patterns
- **BaseModel** - Shared base fields

**Technology:** SQLAlchemy 2.0 ORM

#### 5. **Schemas Layer** (`app/schemas/`)
- Request schemas (Pydantic models for inputs)
- Response schemas (Pydantic models for outputs)
- Validation rules
- Type definitions

**Technology:** Pydantic v2

#### 6. **Core Layer** (`app/core/`)
- **config.py** - Settings management
- **database.py** - SQLAlchemy async setup
- **security.py** - JWT tokens, hashing
- **logging.py** - Structured logging

---

### Frontend Components

#### 1. **Pages** (`src/pages/`)
- **Landing** - Public landing page
- **Login** - Authentication page
- **Register** - User registration
- **Dashboard** - Main application page
- Protected routes using `ProtectedRoute` component

#### 2. **Components** (`src/components/`)
- **UI Components** (30+)
  - Button, Input, Card, Dialog, etc.
  - Radix UI based, fully accessible
  - Styled with TailwindCSS

- **Feature Components**
  - TransactionForm, CategoryManager, BudgetTracker
  - DashboardChart, ReportGenerator
  - Custom business logic components

#### 3. **Services** (`src/services/`)
- **api.ts** - Centralized API client
- 30+ API methods
- Error handling and retry logic
- Request/response transformation

#### 4. **Contexts** (`src/contexts/`)
- **AuthContext** - User authentication state
- **ThemeProvider** - Theme management (light/dark/system)
- **CurrencyContext** - Currency conversion state

#### 5. **Hooks** (`src/hooks/`)
- **useApi** - Data fetching hook
- **useAuth** - Authentication hook
- **Custom hooks** for business logic

#### 6. **Types** (`src/types/`)
- TypeScript interfaces and types
- API response types
- Domain models

---

## 🔄 Data Flow

### Authentication Flow

```
1. User registers/logs in
   └─→ Frontend sends credentials
   └─→ Backend validates
   └─→ JWT tokens generated
   └─→ Frontend stores tokens
   └─→ Redirect to dashboard

2. User makes request
   └─→ Frontend includes access token
   └─→ Backend verifies token
   └─→ Request processed
   └─→ Response returned

3. Token expires
   └─→ Frontend gets 401 response
   └─→ Frontend uses refresh token
   └─→ Backend issues new access token
   └─→ Frontend retries original request
```

### Transaction Flow

```
1. User creates transaction
   └─→ Frontend validates input
   └─→ Frontend sends to API
   └─→ Backend validates
   └─→ Backend saves to database
   └─→ Response returned
   └─→ Frontend updates UI
   └─→ Real-time chart update

2. User filters transactions
   └─→ Frontend sends filter parameters
   └─→ Backend queries database
   └─→ Returns filtered results
   └─→ Frontend renders list

3. Backend generates report
   └─→ Aggregate transaction data
   └─→ Calculate statistics
   └─→ Return JSON response
   └─→ Frontend renders charts
```

---

## 🗄️ Database Schema

### Entity Relationships

```
users (1) ──── (N) transactions
  │
  ├── (1) ──── (N) categories
  │
  ├── (1) ──── (N) budgets
  │
  ├── (1) ──── (N) goals
  │
  └── (1) ──── (N) recurring_transactions

categories (1) ──── (N) transactions
    │
    ├── (1) ──── (N) budgets
    │
    └── (1) ──── (N) recurring_transactions
```

### Key Entities

**Users**
- Stores authentication and user preferences
- Cascade delete on all user data

**Transactions**
- Core financial records
- Links to user and category
- Indexed for fast retrieval

**Categories**
- Predefined or custom categories
- Type: income or expense
- Used for transaction classification

**Budgets**
- Set spending limits by category
- Period-based (monthly, quarterly, yearly)
- Track against actual spending

**Goals**
- Financial objectives
- Track progress over time
- Priority and deadline tracking

**RecurringTransactions**
- Template for automated entries
- Frequency and dates
- Active/inactive control

See [04-DATABASE.md](04-DATABASE.md) for detailed schema.

---

## 🔐 Security Architecture

### Authentication
- **JWT Tokens** - Access (30 min) + Refresh (7 days)
- **Password Hashing** - bcrypt with adaptive rounds
- **Token Blacklist** - Logout invalidation

### Authorization
- **User Isolation** - Users only access own data
- **Role-based** (future) - Admin, User roles
- **Rate Limiting** - SlowAPI on sensitive endpoints

### Data Protection
- **HTTPS** - Encrypted in transit (production)
- **SQL Injection Prevention** - SQLAlchemy ORM
- **Input Validation** - Pydantic schemas
- **CORS** - Configured for allowed origins

### Network Security
- **Reverse Proxy** (Production) - Nginx with security headers
- **Rate Limiting** - Nginx + SlowAPI
- **HTTPS** - SSL/TLS support

---

## 🚀 Deployment Architecture

### Development Environment

```
User's Machine
├── Docker Desktop
├── Frontend Container (Vite dev server)
├── Backend Container (FastAPI uvicorn)
└── Database Container (PostgreSQL)

All services connected via Docker bridge network
Code changes trigger hot-reload
Direct database access via localhost:5432
```

### Production Environment

```
Server
├── Docker Compose
│   ├── Nginx Container (Reverse proxy, Load balancer)
│   ├── Frontend Container (React static server)
│   ├── Backend Container (Gunicorn + Uvicorn)
│   └── Database Container (PostgreSQL, persistent volume)
│
└── Persistent Volumes
    ├── Database data
    └── Application logs
```

---

## 📊 Technology Stack Decision

### Frontend
- **React 19** - Latest features, performance improvements
- **TypeScript** - Type safety, developer experience
- **Vite** - Fast dev server, optimized builds
- **TailwindCSS** - Utility-first, rapid development
- **Radix UI** - Accessibility without sacrifice

Why? Modern stack with excellent DX and UX.

### Backend
- **FastAPI** - Async, built-in validation, auto-docs
- **SQLAlchemy 2.0** - Async ORM, type hints
- **PostgreSQL** - Reliable, feature-rich RDBMS
- **Pydantic v2** - Runtime validation, serialization

Why? Modern Python stack with async support.

### DevOps
- **Docker** - Consistency, isolation
- **Docker Compose** - Local and simple deployment
- **Nginx** - Proven, efficient reverse proxy
- **Alembic** - Database migrations with version control

Why? Industry standard, well-documented.

---

## 🔌 API Design

### RESTful Principles
- **GET** - Read resources
- **POST** - Create resources
- **PUT/PATCH** - Update resources
- **DELETE** - Remove resources

### Response Format
```json
{
  "success": true,
  "data": { /* resource data */ },
  "error": null,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Versioning
- **Current:** v1 (`/api/v1/`)
- **Strategy:** URI-based versioning
- **Backward Compatibility:** Maintained for 2 major versions

### Pagination
- **Default:** 20 items per page
- **Query Params:** `?page=1&limit=50`
- **Response:** Includes `total`, `page`, `pages`

---

## 📈 Scalability Considerations

### Current (MVP)
- Single API instance
- Single database instance
- 100+ concurrent users supported

### Short-term (Phase 2)
- Multiple API instances
- Nginx load balancing
- Database connection pooling
- Caching layer (Redis)

### Long-term (Phase 3+)
- Microservices architecture
- Database replication
- Message queue (RabbitMQ/Kafka)
- Distributed caching
- CDN for assets

---

## 🧪 Testing Architecture

### Backend Testing
- **Unit Tests** - FastAPI endpoints
- **Integration Tests** - Database interactions
- **Service Tests** - Business logic
- **Framework:** pytest with fixtures

### Frontend Testing
- **Unit Tests** - React components
- **Integration Tests** - Component interactions
- **E2E Tests** - Full user workflows
- **Framework:** Vitest + Playwright

### Coverage
- **Backend:** 96% coverage
- **Frontend:** 96% coverage
- **Target:** Maintain >90% coverage

---

## 🔄 CI/CD Pipeline

### Current Setup
- Local development with Docker
- Git-based version control

### Planned (Phase 2)
- GitHub Actions for CI/CD
- Automated testing
- Build artifact generation
- Automated deployment

### Stages
1. **Build** - Compile/bundle code
2. **Test** - Run test suite
3. **Scan** - Security scanning, linting
4. **Deploy** - Push to staging/production

---

## 📊 Monitoring & Logging

### Application Logging
- **Format:** Structured JSON
- **Levels:** DEBUG, INFO, WARNING, ERROR
- **Storage:** File-based (logs/ directory)

### Metrics (Future)
- **Framework:** Prometheus
- **Visualization:** Grafana
- **Key Metrics:**
  - API response times
  - Database query times
  - Error rates
  - User metrics

### Health Checks
- **API Health:** `/api/health` endpoint
- **Database Health:** Connection test
- **Docker Health:** Container health checks

---

## 🌍 Multi-tenant Considerations

### Current Design
- Single-tenant application (one user, one database)
- User isolation via user_id foreign keys

### Future Multi-tenant
- Organization/workspace concept
- Shared database with row-level security
- Audit logging for compliance
- Resource quota management

---

## 📚 See Also

- [03-API-ENDPOINTS.md](03-API-ENDPOINTS.md) - API reference
- [04-DATABASE.md](04-DATABASE.md) - Database schema
- [plutsgrip-api/docs/ARCHITECTURE.md](../plutsgrip-api/docs/ARCHITECTURE.md) - Backend specifics
- [plutsgrip-frond-refac/docs/ARCHITECTURE.md](../plutsgrip-frond-refac/docs/ARCHITECTURE.md) - Frontend specifics

---

**Document Info:** Updated November 2025 | Status: Complete
