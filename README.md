# PlutusGrip - Personal Finance Tracker

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![React](https://img.shields.io/badge/React-19.1.1-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6.svg)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

A complete personal finance tracker application with modern backend (FastAPI) and frontend (React) technologies.

## 🎯 About PlutusGrip

PlutusGrip is a comprehensive solution for managing personal finances with:

- **Smart Budget Management** - Create and monitor budgets by category
- **Financial Goals** - Set and track short-term and long-term objectives
- **Transaction Tracking** - Record and categorize all income and expenses
- **Recurring Transactions** - Automate regular payments
- **Detailed Reports** - Gain insights with charts and analytics
- **Secure Authentication** - JWT-based authentication system
- **Multi-Currency Support** - Manage finances in different currencies

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose** (3.9+)
- **Git**
- Terminal/Command Prompt

### Start Development (Recommended)

```bash
cd "LeP Projects"

# Linux/Mac
bash docker-manage.sh up dev

# Windows
docker-manage.bat up dev

# Or using Make (any OS)
make up
```

**Access the application:**
- 🎨 Frontend: http://localhost:5173
- 🔌 API: http://localhost:8000
- 📚 API Documentation: http://localhost:8000/docs
- 💾 Database: localhost:5432 (PostgreSQL)

### Start Production

```bash
# Review and update .env.prod first!
make up ENV=prod
```

**Access the application:**
- 🌐 Application: http://localhost
- 🔌 API: http://localhost/api

## 📚 Documentation

Complete documentation is available in the `docs/` directory:

| Document | Purpose |
|----------|---------|
| **[docs/00-INDEX.md](docs/00-INDEX.md)** | Documentation hub and navigation |
| **[docs/01-OVERVIEW.md](docs/01-OVERVIEW.md)** | Project vision and goals |
| **[docs/02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md)** | System architecture overview |
| **[docs/03-API-ENDPOINTS.md](docs/03-API-ENDPOINTS.md)** | Complete API endpoints reference |
| **[docs/04-DATABASE.md](docs/04-DATABASE.md)** | Database schema and structure |
| **[docs/05-AUTHENTICATION.md](docs/05-AUTHENTICATION.md)** | Authentication system details |
| **[docs/06-DOCKER-SETUP.md](docs/06-DOCKER-SETUP.md)** | Docker setup and deployment |
| **[docs/07-DEVELOPMENT.md](docs/07-DEVELOPMENT.md)** | Development guide and workflow |
| **[docs/08-TESTING.md](docs/08-TESTING.md)** | Testing strategies and tools |
| **[docs/09-TROUBLESHOOTING.md](docs/09-TROUBLESHOOTING.md)** | Common issues and solutions |
| **[docs/10-DEPLOYMENT.md](docs/10-DEPLOYMENT.md)** | Deployment checklist |
| **[docs/FAQ.md](docs/FAQ.md)** | Frequently asked questions |

**Project-Specific Documentation:**
- [Backend Documentation](plutsgrip-api/README.md) - Backend API details
- [Frontend Documentation](plutsgrip-frond-refac/README.md) - Frontend details

## 📦 Project Structure

```
LeP Projects/
├── docs/                          # 📚 Centralized documentation
├── plutsgrip-api/                 # 🔌 Backend (FastAPI + Python)
│   ├── app/                       # Application code
│   ├── docs/                      # Backend-specific docs
│   ├── alembic/                   # Database migrations
│   └── tests/                     # Backend tests
├── plutsgrip-frond-refac/         # 🎨 Frontend (React + TypeScript)
│   ├── src/                       # Application code
│   ├── docs/                      # Frontend-specific docs
│   └── tests/                     # Frontend tests
├── nginx/                         # 🌐 Nginx configuration
├── docker-compose.dev.yml         # 🐳 Dev environment
├── docker-compose.prod.yml        # 🐳 Prod environment
├── docker-manage.sh               # 📜 Management script (Linux/Mac)
├── docker-manage.bat              # 📜 Management script (Windows)
├── Makefile                       # 🔨 Make targets
└── .env.dev / .env.prod          # Environment variables
```

## 🛠️ Available Commands

### Using Make (Recommended)
```bash
make up              # Start development
make up ENV=prod     # Start production
make down            # Stop containers
make logs            # View all logs
make logs-api        # View API logs
make shell           # Access API shell
make status          # Show container status
make help            # Show all commands
```

### Using Management Script
```bash
# Linux/Mac
bash docker-manage.sh up dev
bash docker-manage.sh logs
bash docker-manage.sh shell

# Windows
docker-manage.bat up dev
docker-manage.bat logs
docker-manage.bat shell
```

## 🏗️ Technology Stack

### Backend
- **FastAPI** - Modern async Python web framework
- **SQLAlchemy 2.0** - Advanced ORM
- **Pydantic v2** - Data validation
- **PostgreSQL** - Relational database
- **JWT** - Secure authentication
- **Pytest** - Testing framework

### Frontend
- **React 19.1.1** - UI library
- **TypeScript 5.9.3** - Type safety
- **Vite 5+** - Build tool
- **TailwindCSS 4.1** - Styling
- **Radix UI** - Accessible components
- **Vitest** - Testing framework

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Nginx** - Reverse proxy
- **Make** - Task automation

## 🧪 Testing

### Backend Tests
```bash
make shell           # Access API container
pytest -v           # Run all tests
pytest --cov        # With coverage
```

### Frontend Tests
```bash
cd plutsgrip-frond-refac
npm test             # Run tests
npm test:coverage    # With coverage
```

## 🔐 Security

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ HTTPS-ready configuration
- ✅ Rate limiting on API
- ✅ CORS protection
- ✅ Security headers in production

## 📊 Features Status

### ✅ Implemented
- User registration and authentication
- Transaction management (CRUD)
- Category management
- Budget tracking
- Goal tracking
- Recurring transactions
- Reports and analytics
- API documentation

### 🚀 In Progress
- Advanced analytics
- Data export functionality
- Multi-currency support
- Notifications system

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

For detailed guide, see [CONTRIBUTING.md](CONTRIBUTING.md)

## 📝 Setup Guide

For detailed setup instructions, see [SETUP.md](SETUP.md)

Quick setup:
1. Clone repository
2. Install Docker & Docker Compose
3. Run `make up`
4. Access http://localhost:5173

## 📞 Support

- 📚 Check [docs/FAQ.md](docs/FAQ.md) for common questions
- 🐛 Report bugs in issues
- 💬 Discuss features in discussions

## 📄 License

MIT License - see LICENSE file for details

## 👥 Authors

Developed with ❤️ using FastAPI, React, and modern web technologies

---

**Last Updated:** November 2025

**Latest Version:** 0.1.0

**Status:** 🟢 Active Development
