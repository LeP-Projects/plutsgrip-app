# Setup Guide - PlutusGrip

Complete setup instructions for both development and production environments.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Development Setup](#development-setup)
- [Production Setup](#production-setup)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required
- **Docker** 20.10+ ([Install](https://docs.docker.com/get-docker/))
- **Docker Compose** 3.9+ (included with Docker Desktop)
- **Git** (for cloning repository)

### Optional
- **Make** (for easier commands)
- **Python 3.11+** (for local development without Docker)
- **Node.js 20+** (for local frontend development)

### System Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| **CPU** | 2 cores | 4+ cores |
| **RAM** | 4GB | 8GB+ |
| **Disk** | 5GB free | 10GB+ free |
| **OS** | Linux, macOS, Windows | Any |

---

## Development Setup

### Step 1: Clone Repository

```bash
cd "path/to/your/projects"
git clone <repository-url>
cd "LeP Projects"
```

### Step 2: Verify Docker Installation

```bash
# Check Docker version
docker --version
# Expected: Docker version 20.10+

# Check Docker Compose version
docker-compose --version
# Expected: Docker Compose version 3.9+

# Test Docker setup
docker run hello-world
# Should display "Hello from Docker!"
```

### Step 3: Start Development Environment

```bash
# Option 1: Using Make (Recommended)
make up

# Option 2: Using Management Script
# Linux/Mac:
bash docker-manage.sh up dev

# Windows:
docker-manage.bat up dev

# Option 3: Using docker-compose directly
docker-compose -f docker-compose.dev.yml up -d
```

### Step 4: Wait for Services to Start

```bash
# Check status
make status

# Watch logs
make logs
```

Services are ready when you see:
```
✓ postgres_dev is running
✓ api_dev is running
✓ frontend_dev is running
```

### Step 5: Verify Access

Open your browser and navigate to:

| URL | Purpose |
|-----|---------|
| http://localhost:5173 | Frontend application |
| http://localhost:8000 | API server |
| http://localhost:8000/docs | API documentation |
| localhost:5432 | Database (for tools like pgAdmin) |

### Step 6: Test the Application

```bash
# 1. Access frontend
# http://localhost:5173

# 2. Create an account
# - Click "Sign Up"
# - Enter email and password
# - Confirm account creation

# 3. Test API directly (optional)
curl http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123!"}'
```

### Development Commands

```bash
# View logs
make logs
make logs-api
make logs-frontend
make logs-db

# Access containers
make shell              # API shell
make shell-db           # Database shell

# Database operations
make migrate-create     # Create migration
make migrate-upgrade    # Run migrations

# Testing
make test              # Run backend tests

# Restart
make restart

# Stop everything
make down
```

---

## Production Setup

### Step 1: Prepare Environment

```bash
# Navigate to project root
cd "LeP Projects"

# Copy production environment file
cp .env.prod .env.prod.local

# Edit with your values
# On Windows:
notepad .env.prod.local
# On Linux/Mac:
nano .env.prod.local
```

### Step 2: Update Configuration

Edit `.env.prod.local` and change:

```env
# Database - CHANGE THESE!
POSTGRES_USER=plutusgrip_prod_user
POSTGRES_PASSWORD=YOUR_STRONG_PASSWORD_HERE    # ⚠️ Change this!

# API - CHANGE THESE!
SECRET_KEY=YOUR_SECRET_KEY_HERE                 # ⚠️ Generate new!
ALLOWED_ORIGINS=https://yourdomain.com          # ⚠️ Set your domain!

# Frontend - CHANGE THIS!
VITE_API_URL=https://yourdomain.com            # ⚠️ Set your domain!
```

#### Generating Strong Credentials

**Password:**
```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[System.Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(32))
```

**SECRET_KEY:**
```bash
# Python (any OS)
python -c "import secrets; print(secrets.token_urlsafe(32))"

# If Python not installed, use password generator above
```

### Step 3: Security Checklist

Before starting production:

- [ ] `POSTGRES_PASSWORD` changed to strong value
- [ ] `SECRET_KEY` changed to random secure value
- [ ] `ALLOWED_ORIGINS` updated to your domain(s)
- [ ] `VITE_API_URL` updated to your domain
- [ ] `.env.prod.local` file is NOT committed to git
- [ ] No placeholder values remain in `.env.prod.local`

### Step 4: Start Production Environment

```bash
# Load production environment
export $(cat .env.prod.local | grep -v '#' | xargs)

# Start production (with safety checks)
make up ENV=prod

# Or using management script
bash docker-manage.sh up prod
```

### Step 5: Verify Production Services

```bash
# Check status
make status ENV=prod

# View logs
make logs ENV=prod

# Test API
curl http://localhost/health
curl http://localhost/api/auth/login
```

### Step 6: Configure Domain (Optional)

To use your actual domain instead of localhost:

1. **Point domain to your server**
   - Update DNS records to point to your server IP

2. **Enable HTTPS (Recommended)**
   - Edit `nginx/prod.conf`
   - Uncomment the HTTPS section
   - Add your SSL certificates

3. **Configure reverse proxy**
   - Update Nginx configuration with your domain
   - Restart containers: `make restart ENV=prod`

### Production Maintenance Commands

```bash
# View all logs
make logs ENV=prod

# View specific service logs
make logs-api ENV=prod
make logs-frontend ENV=prod
make logs-db ENV=prod

# Access containers if needed
make shell ENV=prod
make shell-db ENV=prod

# Restart services
make restart ENV=prod

# Backup database (manual)
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U plutusgrip_prod_user plutusgrip_production > backup.sql

# Update application (after code changes)
make build ENV=prod
make up ENV=prod

# Stop production
make down ENV=prod
```

---

## Switching Between Environments

### From Development to Production

```bash
# 1. Stop development
make down

# 2. Start production
make up ENV=prod
```

### From Production to Development

```bash
# 1. Stop production
make down ENV=prod

# 2. Start development
make up
```

---

## Environment Variables

### Development Variables (.env.dev)

```env
# Database
POSTGRES_USER=plutusgrip_user
POSTGRES_PASSWORD=plutusgrip_password
POSTGRES_DB=plutusgrip_db

# API
SECRET_KEY=dev-super-secret-key-change-this-in-production
ALLOWED_ORIGINS=http://localhost:*,http://127.0.0.1:*

# Frontend
VITE_API_URL=http://localhost:8000
```

### Production Variables (.env.prod)

```env
# Database
POSTGRES_USER=plutusgrip_prod_user
POSTGRES_PASSWORD=CHANGE_THIS_TO_STRONG_PASSWORD
POSTGRES_DB=plutusgrip_production

# API
SECRET_KEY=CHANGE_THIS_TO_SECURE_SECRET_KEY
ALLOWED_ORIGINS=https://yourdomain.com

# Frontend
VITE_API_URL=https://yourdomain.com
```

---

## Troubleshooting

### Docker Issues

**Docker daemon not running:**
```bash
# macOS
open /Applications/Docker.app

# Windows
# Start Docker Desktop from Start menu

# Linux
sudo systemctl start docker
```

**Port already in use:**
```bash
# Find process using port (Linux/Mac)
lsof -i :5173    # Frontend
lsof -i :8000    # API
lsof -i :5432    # Database

# Windows
netstat -ano | findstr :5173

# Kill process or change port in docker-compose.dev.yml
```

### Containers Won't Start

```bash
# Clean everything
make clean

# Rebuild images
make build

# Start fresh
make up
```

### Database Connection Error

```bash
# Check database logs
make logs-db

# Verify database is healthy
make status

# Reset database (dev only)
make clean
make up
```

### API Not Responding

```bash
# Check API logs
make logs-api

# Test connection
curl http://localhost:8000/health

# Restart API
docker-compose -f docker-compose.dev.yml restart api
```

### Frontend Not Connecting to API

```bash
# Verify VITE_API_URL in .env.dev
# Should be: http://localhost:8000

# Check browser console for CORS errors
# See: docs/09-TROUBLESHOOTING.md
```

---

## Next Steps

After setup is complete:

1. **Read Documentation**: Check [docs/00-INDEX.md](docs/00-INDEX.md)
2. **Understand Architecture**: See [docs/02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md)
3. **Start Development**: See [docs/07-DEVELOPMENT.md](docs/07-DEVELOPMENT.md)
4. **Review Docker Setup**: See [docs/06-DOCKER-SETUP.md](docs/06-DOCKER-SETUP.md)

---

## Getting Help

- 📚 Documentation: [docs/](docs/)
- ❓ FAQ: [docs/FAQ.md](docs/FAQ.md)
- 🐛 Issues: Check GitHub issues
- 💬 Discussion: GitHub discussions

---

**Setup Complete! 🎉**

Your development environment is now ready. Start developing!

```bash
make up     # Start development
make logs   # Watch logs
```

Access the application at http://localhost:5173
