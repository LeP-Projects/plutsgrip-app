# Glossary of Terms

Technical terminology and definitions used in PlutusGrip documentation and codebase.

---

## A

### Access Token
A short-lived token (30 minutes) used to authenticate API requests. Included in request headers as `Authorization: Bearer TOKEN`.

**Related:** Refresh Token, JWT, Authentication

### Alembic
Database migration tool for Python SQLAlchemy. Manages database schema versions and evolution.

**Related:** Migration, Database Schema

### Async
Short for "asynchronous." Operations that don't block execution while waiting for results. Used throughout PlutusGrip for I/O operations.

**Related:** Await, Promise, Non-blocking

### Authentication
Process of verifying user identity. PlutusGrip uses email/password with JWT tokens.

**Related:** Authorization, JWT, Token

---

## B

### Backend
Server-side application. In PlutusGrip: FastAPI Python application handling business logic and data.

**Related:** Frontend, API

### bcrypt
Cryptographic hashing algorithm used for secure password storage. Automatically handles salt and iteration rounds.

**Related:** Hashing, Password, Security

### Branch
Git version control concept. Feature branches allow isolated development before merging to main.

**Related:** Git, Merge, Pull Request

### Budget
Financial limit set for a category. Tracks spending against the limit.

**Related:** Category, Transaction, Spending

### Bundle
Final packaged application files ready for deployment. React build generates optimized bundle.

**Related:** Build, Minification, Assets

---

## C

### Category
Classification for transactions (e.g., "Food", "Transport"). Users can create custom categories.

**Related:** Transaction, Budget, Tag

### CI/CD
Continuous Integration / Continuous Deployment. Automated testing and deployment pipeline.

**Related:** GitHub Actions, Testing, Deployment

### CORS
Cross-Origin Resource Sharing. Mechanism allowing frontend to request API from different domains.

**Related:** Security, API, Frontend

### Container
Isolated environment running application with all dependencies. Docker uses containers.

**Related:** Docker, Image, Service

### Coverage
Percentage of code executed by tests. Target 90%+ coverage.

**Related:** Testing, Unit Test, Integration Test

---

## D

### Database
Persistent data storage. PlutusGrip uses PostgreSQL 16.

**Related:** PostgreSQL, Schema, Query

### DBMS
Database Management System. Software managing database operations (PostgreSQL).

**Related:** Database, SQL

### Deployment
Process of releasing application to production environment.

**Related:** Production, Docker, Release

### Docker
Containerization platform enabling consistent development and production environments.

**Related:** Container, Image, Compose

### Docker Compose
Tool for defining and running multi-container Docker applications using YAML files.

**Related:** Docker, Orchestration, Service

---

## E

### Endpoint
Specific API URL path. Example: `POST /api/transactions` creates a transaction.

**Related:** API, Route, HTTP Method

### Environment
Execution context (development, staging, production). Each has different configuration.

**Related:** Config, .env, Production

### Entity
Data object representing real-world concept (User, Transaction, Category).

**Related:** Model, Schema, Database

---

## F

### FastAPI
Python web framework for building APIs. Known for speed, async support, and auto-documentation.

**Related:** Backend, Python, Framework

### Frontend
Client-side application. In PlutusGrip: React TypeScript application running in browser.

**Related:** Backend, UI, React

### Form
HTML structure collecting user input. React components managing form state and validation.

**Related:** Input, Validation, State

### Framework
Reusable library/tools for application development. FastAPI (backend), React (frontend).

**Related:** Library, Dependency

---

## G

### Git
Version control system tracking code changes and enabling collaboration.

**Related:** Repository, Branch, Commit

### Goal
Financial objective with target amount and deadline. Tracks progress toward savings goals.

**Related:** Budget, Savings, Progress

### Grafana
Visualization and monitoring platform creating dashboards from metrics data.

**Related:** Prometheus, Monitoring, Metrics

---

## H

### Hash/Hashing
One-way cryptographic function converting data to fixed-length string. Used for passwords.

**Related:** bcrypt, Security, Encryption

### HealthCheck
Mechanism verifying service is running properly. Docker uses health checks for container management.

**Related:** Docker, Monitoring, Readiness

### Hook
Function executing in response to event. React hooks (useState, useEffect) and Git hooks.

**Related:** Event, Callback, React

### Host
Server or machine running services. localhost = your own machine.

**Related:** Server, Localhost, Domain

---

## I

### Image
Blueprint for Docker container. Contains OS, dependencies, and application code.

**Related:** Docker, Container, Build

### Index
Database structure optimizing query performance. Searches indexed columns faster.

**Related:** Database, Query, Performance

### Integration Test
Test verifying multiple components work together. Tests real workflows.

**Related:** Testing, Unit Test, E2E

### API
Application Programming Interface. Set of rules for communication between applications.

**Related:** Endpoint, REST, Backend

---

## J

### JWT
JSON Web Token. Format for secure, stateless authentication tokens.

**Related:** Token, Authentication, Security

---

## K

### Kubernetes
Container orchestration platform. Manages and scales containerized applications (future scaling).

**Related:** Docker, Scaling, Orchestration

---

## L

### Load Balancing
Distributing requests across multiple servers. Improves performance and reliability.

**Related:** Scaling, Nginx, Reverse Proxy

### Localhost
Current machine (127.0.0.1). Used for development testing.

**Related:** Host, Development, Port

### Logging
Recording application events and errors for debugging and monitoring.

**Related:** Log Level, Monitoring, Debug

---

## M

### Makefile
File defining automated commands for project. `make up`, `make test`, etc.

**Related:** Automation, Command, Script

### Migration
Database schema change tracked in version control. Allows safe schema evolution.

**Related:** Alembic, Database, Schema

### Middleware
Software layer processing requests/responses. Used for authentication, logging, CORS.

**Related:** Request, Response, Processing

### Model
Code representation of database table. Defines structure and relationships.

**Related:** Entity, Database, Schema

### Mock
Fake object replacing real dependency for testing. MSW mocks API responses.

**Related:** Testing, Dependency, Stub

---

## N

### Node.js
JavaScript runtime for server-side execution. Used for frontend build tools (Vite, etc).

**Related:** JavaScript, Runtime, Frontend

### Nginx
High-performance web server and reverse proxy. Used for load balancing and HTTPS.

**Related:** Reverse Proxy, Server, Production

---

## O

### ORM
Object-Relational Mapping. Maps database tables to code objects. SQLAlchemy is PlutusGrip's ORM.

**Related:** Database, Model, Query

### OAuth
Authentication protocol allowing login via third-party provider (Google, GitHub). Planned for Phase 3.

**Related:** Authentication, Third-party, SSO

---

## P

### Pagination
Dividing large result sets into pages. Improves performance and UX.

**Related:** Query, Limit, Offset

### Payload
Data sent in request or response body. JSON object containing parameters or results.

**Related:** Request, Response, JSON

### PostgreSQL
Relational database management system. PlutusGrip's chosen database (version 16).

**Related:** Database, SQL, DBMS

### Pydantic
Python library for data validation using Python type hints. Validates request/response schemas.

**Related:** Validation, Schema, Type Hints

### Port
Endpoint on machine for network communication. API: 8000, Frontend: 5173, DB: 5432.

**Related:** Localhost, Host, Network

### Production
Live environment serving real users. Uses .env.prod configuration.

**Related:** Deployment, Environment, Release

### Pull Request (PR)
Request to merge feature branch into main. Code review mechanism.

**Related:** Git, Branch, Review

---

## Q

### Query
Request to retrieve/modify database data. SQL queries via SQLAlchemy.

**Related:** Database, SQL, ORM

### Queue
Data structure processing tasks in order. Message queues (RabbitMQ) for async tasks.

**Related:** Async, Task, Background Job

---

## R

### React
JavaScript library for building user interfaces. Frontend framework with component-based architecture.

**Related:** Frontend, Component, TypeScript

### Redis
In-memory data store. Used for caching and sessions (planned).

**Related:** Cache, Session, Performance

### Refresh Token
Long-lived token (7 days) used to obtain new access tokens without re-authenticating.

**Related:** Access Token, JWT, Authentication

### Repository Pattern
Design pattern for data access. Separates business logic from database queries.

**Related:** ORM, Database, Architecture

### REST
Representational State Transfer. API design using HTTP methods (GET, POST, PUT, DELETE).

**Related:** API, HTTP, HTTP Methods

### Reverse Proxy
Server forwarding client requests to backend servers. Nginx provides load balancing and HTTPS.

**Related:** Nginx, Load Balancing, Security

### Rollback
Reverting to previous version after failed deployment. Safety mechanism.

**Related:** Deployment, Version Control, Git

### Route
Mapping of URL path to handler function. Defined in API router.

**Related:** Endpoint, API, Path

---

## S

### Schema
Structure definition. Database schema (tables/columns) or request/response schema (Pydantic).

**Related:** Model, Database, Validation

### Seed
Initial data loaded into database. Test data or default categories.

**Related:** Database, Migration, Fixture

### Service
Component containing business logic. Example: AuthService, TransactionService.

**Related:** Architecture, Business Logic, Layer

### Session
User's authenticated state. Tracked via JWT tokens (stateless).

**Related:** Authentication, Token, User

### SQL
Structured Query Language. Language for querying relational databases.

**Related:** Database, Query, PostgreSQL

### SQLAlchemy
Python SQL toolkit and ORM. Handles database operations with type safety.

**Related:** ORM, Database, Python

### SSL/TLS
Secure Socket Layer / Transport Layer Security. Encryption protocol for HTTPS.

**Related:** HTTPS, Security, Certificate

### Stack
Complete set of technologies (Frontend, Backend, Database, Deployment).

**Related:** Technology, Architecture

### State
Current data and condition of application. React uses state management.

**Related:** React, Variables, Data

### Staging
Pre-production environment for testing before release. Similar to production.

**Related:** Environment, Testing, Production

---

## T

### Tag
Label or category. Often synonym for category or metadata.

**Related:** Category, Metadata, Label

### Testing
Automated validation of code correctness. Unit tests, integration tests, E2E tests.

**Related:** Coverage, Quality, Validation

### Transaction
Financial record of money movement (income or expense). Core entity in PlutusGrip.

**Related:** Category, Amount, Date

### TypeScript
Superset of JavaScript adding static typing. Reduces bugs in frontend code.

**Related:** JavaScript, Type Safety, Frontend

---

## U

### Unit Test
Test of single code unit (function, method) in isolation.

**Related:** Testing, Coverage, Isolated

### Upstream
Project dependency. SQLAlchemy is upstream of PlutusGrip's data layer.

**Related:** Dependency, External, Version

### UUID
Universally Unique Identifier. 128-bit identifier ensuring global uniqueness.

**Related:** Identifier, Primary Key

---

## V

### Validation
Process of verifying data correctness before storing. Pydantic handles validation.

**Related:** Schema, Input, Error Handling

### Version
Release number of software. Follows semantic versioning (X.Y.Z).

**Related:** Release, Semantic Versioning, Tag

### Vite
Frontend build tool and dev server. Provides fast hot module replacement (HMR).

**Related:** Frontend, Build Tool, Development

### Volume
Persistent storage for Docker containers. Database data persists in volumes.

**Related:** Docker, Storage, Persistence

---

## W

### Webhook
HTTP callback triggered by events. Can notify external systems of changes (planned).

**Related:** Event, Integration, API

### WebSocket
Protocol for real-time two-way communication. Planned for live notifications.

**Related:** Real-time, Communication, Protocol

---

## X

### XSS
Cross-Site Scripting. Security vulnerability where malicious scripts execute in user's browser.

**Related:** Security, Vulnerability, OWASP

---

## Y

### YAML
Human-readable data serialization format. Used for Docker Compose and configuration files.

**Related:** Configuration, Format, YAML

---

## Z

### Zsh/Bash
Unix shell and command language. Used for command-line scripts and automation.

**Related:** Terminal, Command Line, Script

---

## Related Documentation

- [02-ARCHITECTURE.md](02-ARCHITECTURE.md) - Architecture overview
- [03-API-ENDPOINTS.md](03-API-ENDPOINTS.md) - API specification
- [05-AUTHENTICATION.md](05-AUTHENTICATION.md) - Authentication system

---

**Last Updated:** November 2025 | Status: Complete
