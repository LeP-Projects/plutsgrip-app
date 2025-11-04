# Deployment Guide

Complete instructions for deploying PlutusGrip to production environments.

## 🚀 Deployment Overview

### Deployment Environments

1. **Development** - Local machine, hot-reload enabled
2. **Staging** - Pre-production testing environment
3. **Production** - Live environment for end users

### Architecture

```
┌─────────────────────────────────────────┐
│         Load Balancer / DNS              │
│        (Optional, future scale)          │
└────────────────┬────────────────────────┘
                 │ HTTPS (port 443)
┌────────────────▼────────────────────────┐
│         Nginx Reverse Proxy              │
│  - SSL/TLS termination                  │
│  - Rate limiting                        │
│  - Static file serving                  │
│  - Request routing                      │
└────────────────┬────────────────────────┘
                 │ HTTP (internal)
        ┌────────┼────────┬─────────┐
        │        │        │         │
   ┌────▼─┐ ┌──▼──┐ ┌───▼──┐ ┌───▼──┐
   │ API  │ │ Web │ │ Logs │ │Cache │
   │ App  │ │ App │ │ Vol  │ │Redis │
   └──────┘ └─────┘ └──────┘ └──────┘
        │
   ┌────▼──────────────────────┐
   │   PostgreSQL Database      │
   │  (Persistent Volume)       │
   └────────────────────────────┘
```

---

## 📋 Pre-Deployment Checklist

### Security

- [ ] Change all default passwords
- [ ] Generate strong secret keys
- [ ] Configure SSL/TLS certificates
- [ ] Set CORS to specific domains (not localhost)
- [ ] Enable HTTPS only (no HTTP)
- [ ] Set secure database credentials
- [ ] Configure firewall rules
- [ ] Enable logging and monitoring
- [ ] Review security headers in Nginx
- [ ] Set up rate limiting

### Application

- [ ] Run all tests (backend + frontend)
- [ ] Build production Docker images
- [ ] Test with production environment variables
- [ ] Run database migrations
- [ ] Seed initial data if needed
- [ ] Verify API health endpoint works
- [ ] Check frontend assets load correctly
- [ ] Test critical user workflows

### Infrastructure

- [ ] Verify server has minimum 4GB RAM
- [ ] Ensure 20GB+ free disk space
- [ ] Check network connectivity
- [ ] Configure backup strategy
- [ ] Set up monitoring alerts
- [ ] Test disaster recovery procedure
- [ ] Document deployment steps
- [ ] Have rollback plan ready

### DNS & Domain

- [ ] Domain name registered
- [ ] DNS records pointing to server IP
- [ ] SSL certificate obtained (Let's Encrypt)
- [ ] SSL certificate installed
- [ ] HTTPS working (https://yourdomain.com)

---

## 🔧 Deployment Steps

### Step 1: Prepare Server

**Server Requirements:**
- Linux (Ubuntu 20.04+ recommended)
- Docker and Docker Compose installed
- Minimum 4GB RAM
- 20GB+ free disk space
- SSH access

**On Server:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Create deploy user (optional but recommended)
sudo useradd -m -s /bin/bash deployuser
sudo usermod -aG docker deployuser
```

### Step 2: Clone Repository

```bash
# As deployuser or in /var/www
cd /var/www
git clone https://github.com/your-username/plutusgrip.git
cd plutusgrip

# Or copy files if not using git
scp -r ./LeP\ Projects/ deployuser@server:/var/www/plutusgrip/
```

### Step 3: Configure Environment Variables

**Create `.env.prod`:**

```bash
# Database
DATABASE_URL=postgresql://plutusgrip_prod_user:STRONG_RANDOM_PASSWORD_HERE@postgres:5432/plutusgrip_prod

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4

# Security (GENERATE NEW!)
SECRET_KEY=generate-random-32-char-key-here

# CORS Configuration
CORS_ORIGINS=https://yourdomain.com

# Frontend
FRONTEND_URL=https://yourdomain.com

# Logging
LOG_LEVEL=INFO

# Email (if notifications implemented)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Other
ENVIRONMENT=production
DEBUG=false
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

**Security: Generate Strong Keys**

```bash
# Generate secret key
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate random password
python3 -c "import secrets; print(secrets.token_hex(16))"
```

### Step 4: SSL/TLS Certificate

**Using Let's Encrypt (Free):**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Generate certificate
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your-email@example.com \
  --agree-tos

# Verify certificate
ls /etc/letsencrypt/live/yourdomain.com/

# Copy to project (for Docker to access)
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./nginx/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./nginx/
sudo chown $USER:$USER ./nginx/*.pem
```

**Using Self-Signed Certificate (Testing Only):**

```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -nodes \
  -out ./nginx/cert.pem \
  -keyout ./nginx/key.pem \
  -days 365 \
  -subj "/C=US/ST=State/L=City/O=Org/CN=yourdomain.com"
```

### Step 5: Update Nginx Configuration

**Edit `nginx/prod.conf`:**

```nginx
# Change server_name
server_name yourdomain.com www.yourdomain.com;

# Update upstream to api service name
upstream api_backend {
    server api:8000;
    keepalive 32;
}

# Uncomment HTTPS section and update paths
listen 443 ssl http2;
ssl_certificate /etc/nginx/certs/fullchain.pem;
ssl_certificate_key /etc/nginx/certs/privkey.pem;

# Update API_URL for frontend build
ENV VITE_API_URL=https://yourdomain.com
```

### Step 6: Build Production Images

```bash
# Build frontend (multi-stage build for production)
docker-compose -f docker-compose.prod.yml build frontend

# Build API
docker-compose -f docker-compose.prod.yml build api

# Or build all
docker-compose -f docker-compose.prod.yml build

# Verify images
docker images | grep plutusgrip
```

### Step 7: Start Services

```bash
# Start with production compose file
docker-compose -f docker-compose.prod.yml up -d

# Verify services are running
docker-compose -f docker-compose.prod.yml ps

# Check logs for errors
docker-compose -f docker-compose.prod.yml logs
```

### Step 8: Run Database Migrations

```bash
# Apply migrations
docker-compose -f docker-compose.prod.yml exec api alembic upgrade head

# Verify migrations
docker-compose -f docker-compose.prod.yml exec api alembic current

# Seed initial data if needed
docker-compose -f docker-compose.prod.yml exec api python scripts/seed_data.py
```

### Step 9: Verify Deployment

```bash
# Check health endpoint
curl https://yourdomain.com/api/health

# Check frontend is accessible
curl https://yourdomain.com/

# Test API endpoint (auth should fail without token)
curl https://yourdomain.com/api/auth/me

# Check logs
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Step 10: Set Up Monitoring & Backups

**Set up log rotation:**

```bash
# Create logrotate config
sudo nano /etc/logrotate.d/plutusgrip

# Add:
/var/lib/docker/volumes/plutusgrip_logs/_data/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 root root
}
```

**Set up database backups:**

```bash
# Create backup script
cat > /usr/local/bin/backup-plutusgrip.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/plutusgrip"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup database
docker-compose -f /var/www/plutusgrip/docker-compose.prod.yml exec -T postgres \
  pg_dump -U plutusgrip_prod_user plutusgrip_prod \
  > $BACKUP_DIR/db_$TIMESTAMP.sql

# Compress
gzip $BACKUP_DIR/db_$TIMESTAMP.sql

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/db_$TIMESTAMP.sql.gz"
EOF

chmod +x /usr/local/bin/backup-plutusgrip.sh

# Schedule daily backup at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-plutusgrip.sh") | crontab -
```

---

## 📊 Production Configuration

### Resource Limits

**In docker-compose.prod.yml:**

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  frontend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

  postgres:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Health Checks

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Auto-Restart Policy

```yaml
restart_policy:
  condition: on-failure
  delay: 5s
  max_attempts: 3
  window: 120s
```

---

## 🔄 Continuous Deployment (CI/CD)

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run tests
        run: |
          docker-compose -f docker-compose.dev.yml exec -T api pytest

      - name: Deploy to server
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
          DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}
        run: |
          mkdir -p ~/.ssh
          echo "$DEPLOY_KEY" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh -i ~/.ssh/deploy_key deploy@$DEPLOY_HOST << 'DEPLOY'
            cd /var/www/plutusgrip
            git pull origin main
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d
            docker-compose -f docker-compose.prod.yml exec -T api alembic upgrade head
          DEPLOY
```

---

## 🔄 Rollback Procedure

### Automatic Rollback on Failure

```bash
# If deployment fails, Docker restart policy kicks in
# Services will auto-restart on failure (max 3 attempts)

# Manual rollback to previous version
docker-compose -f docker-compose.prod.yml down
git checkout previous-working-commit
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml exec api alembic downgrade -1
```

### Backup & Restore Database

```bash
# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U plutusgrip_prod_user plutusgrip_prod < /backups/plutusgrip/db_20250115_020000.sql
```

---

## 📈 Scaling

### Current Capacity

- **Single Server:** ~100 concurrent users
- **Storage:** 20GB (configurable with volumes)
- **Response Time:** <500ms p95

### Scaling Strategies (Phase 2+)

1. **Horizontal Scaling**
   ```bash
   # Use Kubernetes instead of Docker Compose
   kubectl scale deployment/api --replicas=3
   ```

2. **Database Replication**
   - Primary-replica setup
   - Read replicas for reporting

3. **Caching Layer**
   - Redis for session/data caching
   - CDN for static assets

4. **Message Queue**
   - RabbitMQ/Kafka for async tasks
   - Email notifications, reports

---

## 🛡️ Production Security Hardening

### Firewall Rules

```bash
# Allow only necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH (for management)
sudo ufw allow 22/tcp

# HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### SSL/TLS Best Practices

```nginx
# In nginx/prod.conf
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;

# HSTS (strict transport security)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# CSP (content security policy)
add_header Content-Security-Policy "default-src 'self'; script-src 'self'" always;
```

### Regular Updates

```bash
# Weekly updates
sudo apt update && sudo apt upgrade -y

# Update Docker images monthly
docker pull postgres:16-alpine
docker pull node:20-alpine
docker pull python:3.11-slim

# Rebuild images with updates
docker-compose -f docker-compose.prod.yml build --no-cache
```

---

## 📊 Monitoring & Alerts

### Key Metrics to Monitor

1. **Application**
   - API response time
   - Error rate (5xx errors)
   - Request rate

2. **Infrastructure**
   - CPU usage
   - Memory usage
   - Disk space
   - Network I/O

3. **Database**
   - Query response time
   - Connection count
   - Query load

### Tools

- **Prometheus** - Metrics collection
- **Grafana** - Visualization and dashboards
- **AlertManager** - Alert notifications
- **ELK Stack** - Logging (Elasticsearch, Logstash, Kibana)

---

## 🚨 Emergency Procedures

### Service Down - Quick Restart

```bash
# Restart everything
docker-compose -f docker-compose.prod.yml restart

# Or restart specific service
docker-compose -f docker-compose.prod.yml restart api
```

### Database Corruption - Recovery

```bash
# Stop services
docker-compose -f docker-compose.prod.yml down

# Restore from backup
docker-compose -f docker-compose.prod.yml up postgres
docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U plutusgrip_prod_user plutusgrip_prod < /backups/db_backup.sql

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

### Out of Disk Space - Cleanup

```bash
# Remove old Docker images
docker image prune -a --filter "until=720h"

# Remove unused volumes
docker volume prune

# Check disk usage
df -h
du -sh /var/lib/docker/*
```

---

## 📚 Related Documentation

- [06-DOCKER-SETUP.md](06-DOCKER-SETUP.md) - Docker configuration
- [02-ARCHITECTURE.md](02-ARCHITECTURE.md) - System architecture
- [09-TROUBLESHOOTING.md](09-TROUBLESHOOTING.md) - Common issues
- [SETUP.md](../SETUP.md) - Setup guide

---

**Last Updated:** November 2025 | Status: Complete
