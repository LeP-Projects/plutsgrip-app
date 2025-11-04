# PlutusGrip Docker Setup

Complete Docker configuration for running PlutusGrip backend (FastAPI) and frontend (React) in development and production environments.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Production Setup](#production-setup)
- [Available Commands](#available-commands)
- [Services & Ports](#services--ports)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose (version 3.9+)
- Git
- Terminal/Command Prompt

### Development (Recommended for first time)

```bash
# Navigate to project root
cd "LeP Projects"

# Start development environment
bash docker-manage.sh up dev
# Or on Windows:
docker-manage.bat up dev
# Or with make:
make up
```

**Access points:**
- Frontend: http://localhost:5173
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Database: localhost:5432

### Production

```bash
# Start production environment
bash docker-manage.sh up prod
# Or:
make up ENV=prod
```

**Access points:**
- Application: http://localhost
- API: http://localhost/api
- API Docs: http://localhost/docs

---

## 📁 Project Structure

```
LeP Projects/
├── plutsgrip-api/                    # Backend (FastAPI)
│   ├── Dockerfile                    # Production backend image
│   ├── Dockerfile.dev                # Development backend image
│   ├── docker-compose.development.yml # (existing - not used by root docker)
│   ├── docker-compose.production.yml  # (existing - not used by root docker)
│   └── app/
│
├── plutsgrip-frond-refac/            # Frontend (React)
│   ├── Dockerfile                    # Production frontend image
│   ├── Dockerfile.dev                # Development frontend image
│   ├── .dockerignore                 # Docker build exclusions
│   └── src/
│
├── nginx/
│   └── prod.conf                     # Nginx reverse proxy config (production)
│
├── docker-compose.dev.yml            # Development orchestration (root)
├── docker-compose.prod.yml           # Production orchestration (root)
├── .env.dev                          # Development environment variables
├── .env.prod                         # Production environment variables
├── docker-manage.sh                  # Linux/Mac management script
├── docker-manage.bat                 # Windows management script
├── Makefile                          # Make targets for commands
└── DOCKER_README.md                  # This file
```

---

## 🛠 Development Setup

### Starting Development

```bash
# Using the management script
bash docker-manage.sh up dev

# Or with Make
make up

# Or with docker-compose directly
docker-compose -f docker-compose.dev.yml up -d
```

### Services in Development

| Service | Port | Purpose |
|---------|------|---------|
| **PostgreSQL** | 5432 | Database (direct access) |
| **Backend API** | 8000 | FastAPI with hot-reload |
| **Frontend** | 5173 | Vite dev server with hot-reload |

### Development Features

✅ **Hot-reload enabled** - Code changes trigger automatic restart
✅ **Direct DB access** - Connect to postgres:5432 with pgAdmin/DBeaver
✅ **Debug logging** - Full debug output in logs
✅ **Volume mounts** - Edit code and see changes instantly
✅ **Database initialization** - Auto-created with demo data

### Development Workflow

```bash
# 1. Start environment
make up

# 2. View logs in real-time
make logs

# 3. Access API shell for debugging
make shell

# 4. Access database shell
make shell-db

# 5. Run tests
make test

# 6. Restart after major changes
make restart

# 7. Stop when done
make down
```

### Environment Variables (Development)

Located in `.env.dev`:

```env
POSTGRES_USER=plutusgrip_user
POSTGRES_PASSWORD=plutusgrip_password
POSTGRES_DB=plutusgrip_db
SECRET_KEY=dev-super-secret-key-change-this-in-production
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8000,...
VITE_API_URL=http://localhost:8000
```

---

## 🚀 Production Setup

### Starting Production

```bash
# IMPORTANT: Review .env.prod before running!
# ⚠️  Change POSTGRES_PASSWORD and SECRET_KEY!

bash docker-manage.sh up prod

# Or:
make up ENV=prod

# Or directly:
docker-compose -f docker-compose.prod.yml up -d
```

### Services in Production

| Service | Port | Purpose |
|---------|------|---------|
| **PostgreSQL** | (internal) | Database (not exposed) |
| **Backend API** | (internal) | FastAPI with Gunicorn |
| **Frontend** | (internal) | Nginx static server |
| **Nginx** | 80 | Reverse proxy & load balancer |

### Production Features

✅ **Optimized builds** - Multi-stage Docker builds, minimal image sizes
✅ **Non-root users** - Security hardening
✅ **Resource limits** - CPU and memory constraints
✅ **Reverse proxy** - Nginx load balancing and caching
✅ **Health checks** - Automated monitoring
✅ **Auto-restart** - Containers restart on failure
✅ **Gzip compression** - Enabled for all responses
✅ **Rate limiting** - Nginx rate limiting on endpoints
✅ **Security headers** - CORS, X-Frame-Options, etc.

### Production Security Checklist

Before deploying to production:

- [ ] Change `POSTGRES_PASSWORD` in `.env.prod`
- [ ] Generate new `SECRET_KEY` (use `python -c "import secrets; print(secrets.token_urlsafe(32)"`)
- [ ] Update `ALLOWED_ORIGINS` to your actual domain
- [ ] Review `.env.prod` for any placeholder values
- [ ] Set up SSL/TLS certificates (enable in nginx/prod.conf)
- [ ] Configure backups for PostgreSQL data
- [ ] Monitor logs and health checks
- [ ] Load test before full deployment

### Environment Variables (Production)

Located in `.env.prod`:

```env
# ⚠️  CHANGE THESE BEFORE DEPLOYING!
POSTGRES_USER=plutusgrip_prod_user
POSTGRES_PASSWORD=CHANGE_THIS_TO_STRONG_PASSWORD_IN_PRODUCTION
POSTGRES_DB=plutusgrip_production
SECRET_KEY=CHANGE_THIS_TO_SECURE_SECRET_KEY_GENERATED_VALUE
ALLOWED_ORIGINS=http://localhost  # Change to your domain!
VITE_API_URL=http://localhost     # Change to your domain!
```

---

## 📝 Available Commands

### Using the Management Script

#### Linux/Mac
```bash
./docker-manage.sh [command] [environment]

# Examples:
./docker-manage.sh up dev           # Start dev
./docker-manage.sh up prod          # Start prod
./docker-manage.sh logs dev         # View logs
./docker-manage.sh shell prod       # Access prod API shell
./docker-manage.sh status dev       # Show status
./docker-manage.sh down dev         # Stop dev
./docker-manage.sh restart dev      # Restart dev
./docker-manage.sh build dev        # Build images
./docker-manage.sh clean dev        # Remove everything (WARNING!)
```

#### Windows
```batch
docker-manage.bat [command] [environment]

# Examples:
docker-manage.bat up dev
docker-manage.bat logs prod
docker-manage.bat shell dev
```

### Using Make

```bash
make up                    # Start dev
make up ENV=prod          # Start prod
make down                 # Stop current
make logs                 # View logs
make logs-api             # View API logs only
make logs-frontend        # View Frontend logs only
make logs-db              # View Database logs only
make shell                # Access API shell
make shell-db             # Access database shell
make restart              # Restart containers
make build                # Build images
make clean                # Remove everything
make status               # Show status
make test                 # Run tests
make help                 # Show help
```

### Using docker-compose Directly

```bash
# Development
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml logs -f
docker-compose -f docker-compose.dev.yml exec api bash
docker-compose -f docker-compose.dev.yml down

# Production
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml logs -f
docker-compose -f docker-compose.prod.yml down
```

---

## 🔌 Services & Ports

### Development

```
┌─────────────────────────────────────┐
│        Your Machine (localhost)     │
├─────────────────────────────────────┤
│ :5173  → Frontend (Vite dev server) │
│ :8000  → API (FastAPI)              │
│ :5432  → Database (PostgreSQL)      │
└─────────────────────────────────────┘
```

### Production

```
┌──────────────────────────────────┐
│     Your Machine (localhost)     │
├──────────────────────────────────┤
│ :80    → Nginx (reverse proxy)   │
│         ├─→ /api → API          │
│         └─→ /    → Frontend      │
└──────────────────────────────────┘

Database & services are internal (not exposed)
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find which process is using the port
# Linux/Mac:
lsof -i :5173    # Frontend
lsof -i :8000    # API
lsof -i :5432    # Database

# Windows:
netstat -ano | findstr :5173

# Kill the process or use different ports:
# Edit docker-compose.dev.yml:
# ports:
#   - "5174:5173"  (change host port from 5173 to 5174)
```

### Database Connection Error

```bash
# Check database logs
make logs-db

# Verify database is healthy
make status

# If corrupted, clean and restart
make clean
make up
```

### Frontend Not Connecting to API

```bash
# Check VITE_API_URL in .env.dev
# Should be: http://localhost:8000 (dev)
#            http://localhost (prod)

# Verify API is running
make status

# Check API logs
make logs-api
```

### Containers Won't Start

```bash
# Check detailed error logs
docker-compose -f docker-compose.dev.yml logs

# Rebuild images
make build

# Start fresh
make clean
make up
```

### Out of Disk Space

```bash
# Remove unused Docker data
docker system prune -a --volumes

# Or specific to this project
make clean
```

### Permission Denied on docker-manage.sh (Linux/Mac)

```bash
# Make script executable
chmod +x docker-manage.sh

# Then run normally
./docker-manage.sh up dev
```

---

## 📊 Monitoring

### View Container Status

```bash
make status

# Or:
docker-compose -f docker-compose.dev.yml ps
```

### View Real-time Logs

```bash
# All services
make logs

# Specific services
make logs-api
make logs-frontend
make logs-db
```

### Access Container Shell

```bash
# API container
make shell
# Then: apt-get install -y your-package

# Database container
make shell-db
# Then: psql -U plutusgrip_user -d plutusgrip_db
```

---

## 🔄 Scaling & Performance

### Development

The dev environment is optimized for quick development cycles:
- Single API process (Uvicorn)
- Hot-reload enabled
- 5 database connections (DB_POOL_SIZE)
- No resource limits

### Production

The prod environment is optimized for performance:
- Multiple API processes (4 Gunicorn workers)
- Resource limits enabled (CPU & memory)
- 20 database connections (DB_POOL_SIZE)
- Nginx reverse proxy with rate limiting
- Gzip compression enabled

### Horizontal Scaling (Advanced)

To run multiple API instances:

```yaml
# In docker-compose.prod.yml, replace:
api:
  # ... config ...

# With:
api:
  deploy:
    replicas: 3

# Nginx upstream will auto-load-balance
```

---

## 🔐 Security Notes

### Development

⚠️ **Not suitable for production**
- Debug mode enabled
- Default weak credentials
- No HTTPS
- All ports exposed
- No rate limiting

### Production

✅ **Hardened for production**
- Debug mode disabled
- Must change credentials (.env.prod)
- HTTPS ready (configure in nginx/prod.conf)
- Ports behind reverse proxy
- Rate limiting enabled
- Security headers configured
- Non-root user execution
- Resource limits enforced

### Before Deploying to Production

1. **Change credentials**
   ```bash
   # Generate strong password
   openssl rand -base64 32

   # Update .env.prod:
   POSTGRES_PASSWORD=your-strong-password
   SECRET_KEY=your-generated-secret-key
   ```

2. **Enable HTTPS**
   - Uncomment SSL section in `nginx/prod.conf`
   - Provide SSL certificates

3. **Set correct domain**
   ```env
   ALLOWED_ORIGINS=https://yourdomain.com
   VITE_API_URL=https://yourdomain.com
   ```

4. **Review security headers**
   - Check `nginx/prod.conf` security section
   - Adjust CSP headers if needed

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Docker Documentation](https://fastapi.tiangolo.com/deployment/docker/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## ✅ Checklist for First Run

- [ ] Clone/navigate to project
- [ ] Verify Docker & Docker Compose installed
- [ ] Review `.env.dev` (optional changes)
- [ ] Run `make up` or `bash docker-manage.sh up dev`
- [ ] Wait for all services to start (20-30 seconds)
- [ ] Access http://localhost:5173 (frontend)
- [ ] Access http://localhost:8000/docs (API docs)
- [ ] Try creating an account and logging in

---

## ✅ Checklist for Production Deployment

- [ ] Review `.env.prod`
- [ ] Change `POSTGRES_PASSWORD` to strong value
- [ ] Generate and set `SECRET_KEY`
- [ ] Update `ALLOWED_ORIGINS` to your domain
- [ ] Update `VITE_API_URL` to your domain
- [ ] Configure SSL certificates (optional but recommended)
- [ ] Run `make up ENV=prod`
- [ ] Verify all services are running (`make status`)
- [ ] Test API endpoints
- [ ] Test frontend functionality
- [ ] Set up monitoring/logging
- [ ] Configure backups for database

---

## 🆘 Need Help?

If you encounter issues:

1. Check the **Troubleshooting** section above
2. View logs: `make logs`
3. Check container status: `make status`
4. Verify .env files are correct
5. Try rebuilding: `make clean && make build && make up`

---

## 📝 Notes

- Development and production environments are completely separate
- Data in dev environment is lost when running `make clean`
- Production data is persisted in `postgres_data_prod` volume
- All services communicate via Docker networks (internal DNS)
- Frontend always uses http://localhost:8000 to reach API in dev
- Frontend uses reverse proxy path /api in production

---

**Last Updated:** November 2025
