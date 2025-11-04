# Troubleshooting Guide

Solutions for common issues and problems when developing, deploying, or running PlutusGrip.

## 🚨 Common Issues by Category

---

## 🐳 Docker Issues

### "Docker daemon is not running"

**Problem:** Docker commands fail with "Cannot connect to Docker daemon"

**Solutions:**

1. **Start Docker Desktop** (Windows/macOS)
   - Open Docker Desktop application
   - Wait for it to fully start (look for green indicator)

2. **Start Docker daemon** (Linux)
   ```bash
   sudo systemctl start docker
   ```

3. **Verify Docker is running**
   ```bash
   docker ps
   docker --version
   ```

### "Port already in use"

**Problem:** `docker-compose` fails with "port X is already in use"

**Solutions:**

1. **Find process using port**
   ```bash
   # Linux/macOS
   lsof -i :5173  # Frontend
   lsof -i :8000  # API
   lsof -i :5432  # Database

   # Windows (PowerShell)
   netstat -ano | findstr :5173
   Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess
   ```

2. **Kill process**
   ```bash
   # Linux/macOS
   kill -9 <PID>

   # Windows (PowerShell as admin)
   Stop-Process -Id <PID> -Force
   ```

3. **Or change port in docker-compose**
   ```yaml
   services:
     frontend:
       ports:
         - "5174:5173"  # Use 5174 instead of 5173
   ```

4. **Restart Docker**
   ```bash
   make down
   make clean
   make up
   ```

### "Docker container exits immediately"

**Problem:** Container starts then stops without error message

**Solutions:**

1. **Check logs**
   ```bash
   make logs-api
   make logs-frontend
   make logs-db
   ```

2. **Run with interactive terminal**
   ```bash
   docker-compose -f docker-compose.dev.yml run --rm api bash
   ```

3. **Common causes:**
   - Missing environment variables → Check `.env.dev`
   - Database not ready → Add healthcheck wait logic
   - Permission issues → Check file ownership in volumes
   - Insufficient disk space → Run `df -h`

### "Cannot connect to database"

**Problem:** "Connection refused" or "database does not exist"

**Solutions:**

1. **Verify database container is running**
   ```bash
   make status
   docker-compose -f docker-compose.dev.yml ps
   ```

2. **Check database logs**
   ```bash
   make logs-db
   ```

3. **Manually connect to database**
   ```bash
   make shell-db
   # Inside container:
   psql -U plutusgrip_user -d plutusgrip_db
   ```

4. **Reset database (DELETES ALL DATA)**
   ```bash
   make clean
   make up
   # Migrations will run automatically
   ```

5. **Wait longer for database to initialize**
   - First boot takes 20-30 seconds
   - Check healthcheck: `docker-compose ps` (should show healthy)

### "Disk space full"

**Problem:** Docker build fails or database can't write

**Solutions:**

1. **Check disk usage**
   ```bash
   df -h
   docker system df
   ```

2. **Clean Docker**
   ```bash
   docker system prune -a --volumes
   make clean
   ```

3. **Remove old images**
   ```bash
   docker image rm $(docker images -q)
   ```

---

## 🔗 Network & Connectivity Issues

### "Connection refused" on localhost:8000

**Problem:** API doesn't respond at `http://localhost:8000`

**Solutions:**

1. **Verify API is running**
   ```bash
   make status
   # Should show "api" container as "Up"
   ```

2. **Check API logs**
   ```bash
   make logs-api
   # Look for startup errors or port binding issues
   ```

3. **Try connecting from container**
   ```bash
   make shell
   curl http://localhost:8000/api/health
   # If this works, issue is with host networking
   ```

4. **Restart API**
   ```bash
   docker-compose -f docker-compose.dev.yml restart api
   ```

5. **Check firewall** (Windows)
   - Windows Defender → Allow Docker through firewall
   - Or check with: `netsh advfirewall show allprofiles`

### "Frontend can't reach API"

**Problem:** CORS error or 404 when frontend calls API

**Solutions:**

1. **Check CORS configuration**
   - In `.env.dev`: Verify `CORS_ORIGINS` includes `http://localhost:5173`
   - Check `app/core/config.py` CORS settings

2. **Verify API_URL in frontend**
   ```bash
   # In .env.dev (frontend root):
   VITE_API_URL=http://localhost:8000
   ```

3. **Check network in browser**
   - Open DevTools (F12) → Network tab
   - Look for failed requests
   - Check request URL and response

4. **Test API directly**
   ```bash
   curl http://localhost:8000/api/health
   # Should return 200 with health status
   ```

5. **Restart frontend**
   ```bash
   docker-compose -f docker-compose.dev.yml restart frontend
   ```

### "DNS resolution fails"

**Problem:** Container can't resolve other service names

**Solutions:**

1. **Verify network exists**
   ```bash
   docker network ls
   docker network inspect plutusgrip_network
   ```

2. **Check docker-compose networking**
   ```yaml
   services:
     api:
       networks:
         - plutusgrip_network

   networks:
     plutusgrip_network:
   ```

3. **Restart services**
   ```bash
   make restart
   ```

---

## 🔐 Authentication Issues

### "Invalid token" or "Token expired"

**Problem:** Authorization header rejected or 401 Unauthorized

**Solutions:**

1. **Token format must be correct**
   ```
   Authorization: Bearer <token>
   # Not: Authorization: Token <token>
   # Not: Authorization: <token>
   ```

2. **Refresh token if expired**
   ```bash
   curl -X POST http://localhost:8000/api/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{"refresh_token": "YOUR_REFRESH_TOKEN"}'
   ```

3. **Get new token**
   ```bash
   curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "Test@123"}'
   ```

4. **Clear browser storage and login again**
   - DevTools → Application → localStorage/sessionStorage
   - Delete auth tokens
   - Log back in

### "Login fails" or "Invalid credentials"

**Problem:** Email/password rejected even with correct credentials

**Solutions:**

1. **Verify user exists in database**
   ```bash
   make shell-db
   psql -U plutusgrip_user -d plutusgrip_db
   SELECT * FROM users WHERE email = 'test@example.com';
   ```

2. **Check password requirements**
   - Minimum 8 characters
   - Must contain: uppercase, lowercase, number, special character
   - Example: `Test@123` ✓

3. **Test with known user**
   - Seed data should have test users
   - Check backend logs for password validation errors

4. **Reset user password** (Dev only)
   ```bash
   make shell-db
   # Manual SQL to update password hash
   ```

### "Rate limit exceeded"

**Problem:** Getting 429 Too Many Requests

**Solutions:**

1. **Wait before retrying**
   - Login endpoint: Max 5 requests per 15 minutes
   - Register endpoint: Max 3 requests per hour

2. **Check rate limit headers**
   ```bash
   curl -i http://localhost:8000/api/auth/login
   # Look for: X-RateLimit-* headers
   ```

3. **Bypass in development** (if needed)
   - Edit `app/core/config.py`
   - Disable SlowAPI rate limiting
   - Restart API

---

## 💾 Database Issues

### "Migration failed" or "Alembic error"

**Problem:** Database migrations won't apply

**Solutions:**

1. **Check migration status**
   ```bash
   docker-compose -f docker-compose.dev.yml exec api alembic current
   docker-compose -f docker-compose.dev.yml exec api alembic history
   ```

2. **Rollback last migration**
   ```bash
   docker-compose -f docker-compose.dev.yml exec api alembic downgrade -1
   ```

3. **Reset database**
   ```bash
   make clean
   make up
   ```

4. **Check migration files syntax**
   ```bash
   ls plutsgrip-api/alembic/versions/
   ```

### "Table doesn't exist" or "Column not found"

**Problem:** SQL errors about missing tables or columns

**Solutions:**

1. **Verify migrations ran**
   ```bash
   make shell-db
   \dt  # List all tables
   ```

2. **Manually run migrations**
   ```bash
   docker-compose -f docker-compose.dev.yml exec api alembic upgrade head
   ```

3. **Check database schema**
   ```bash
   make shell-db
   \d transactions  # Describe table
   ```

4. **Reset and restart** (DEV ONLY - LOSES DATA)
   ```bash
   make clean
   make up
   ```

### "Slow queries" or "Database timeout"

**Problem:** Database operations taking too long

**Solutions:**

1. **Identify slow queries**
   ```bash
   make shell-db
   SELECT query, mean_exec_time FROM pg_stat_statements
   ORDER BY mean_exec_time DESC LIMIT 5;
   ```

2. **Check missing indexes**
   ```bash
   # Look for N_tup_returned vs idx_tup_read
   SELECT * FROM pg_stat_user_tables ORDER BY seq_scan DESC;
   ```

3. **Add indexes** (in migration)
   ```python
   # In alembic migration
   op.create_index('idx_transactions_user', 'transactions', ['user_id'])
   ```

4. **Optimize queries** (backend)
   - Use `select(Model).where()` instead of filtering in Python
   - Use `.options(selectinload(...))` for relationships
   - Add pagination to large queries

---

## 🎨 Frontend Issues

### "Page won't load" or blank white screen

**Problem:** Frontend doesn't display content

**Solutions:**

1. **Check browser console** (F12)
   - Look for red error messages
   - JavaScript errors usually shown there

2. **Check network requests**
   - DevTools → Network tab
   - Look for failed requests (red)
   - Check 404, 500 errors

3. **Restart frontend**
   ```bash
   docker-compose -f docker-compose.dev.yml restart frontend
   ```

4. **Clear browser cache**
   ```
   Ctrl+Shift+Delete (Windows)
   Cmd+Shift+Delete (macOS)
   Ctrl+H (Linux)
   ```

5. **Check frontend logs**
   ```bash
   make logs-frontend
   ```

### "Hot reload not working"

**Problem:** Changes to code don't auto-refresh

**Solutions:**

1. **Verify Vite is running**
   ```bash
   make logs-frontend
   # Should show "ready in X ms"
   ```

2. **Check file is in watched directory**
   - Vite watches `src/` directory
   - Changes to `src/` should trigger reload
   - Check `vite.config.ts` watch configuration

3. **Force refresh**
   - DevTools → disable cache
   - Cmd+Shift+R (hard refresh)
   - Close and reopen browser

4. **Restart frontend**
   ```bash
   docker-compose -f docker-compose.dev.yml restart frontend
   ```

### "TypeScript errors" or "Import failed"

**Problem:** Red underlines or module not found

**Solutions:**

1. **Check import path**
   ```typescript
   // Correct
   import { Component } from '@/components/Component'

   // Wrong
   import { Component } from '/components/Component'
   ```

2. **Verify TypeScript config**
   ```bash
   cd plutsgrip-frond-refac
   cat tsconfig.json
   # Check "paths" alias configuration
   ```

3. **Rebuild types**
   ```bash
   npm run build
   npm run type-check
   ```

4. **Clean node_modules**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### "CORS error" in browser

**Problem:** "Access to XMLHttpRequest has been blocked by CORS policy"

**Solutions:**

1. **Check API CORS configuration**
   - Backend: `app/core/config.py` `CORS_ORIGINS`
   - Should include `http://localhost:5173`

2. **Restart API**
   ```bash
   docker-compose -f docker-compose.dev.yml restart api
   ```

3. **Test with curl** (bypass CORS)
   ```bash
   curl -H "Origin: http://localhost:5173" \
        http://localhost:8000/api/transactions
   # Should return 200, not CORS error
   ```

4. **Check request method**
   - Some preflight requests return 204
   - Ensure OPTIONS method is allowed

---

## 🔨 Backend Issues

### "API not responding" or "Connection reset"

**Problem:** API requests hang or timeout

**Solutions:**

1. **Check API is running**
   ```bash
   make status
   curl http://localhost:8000/api/health
   ```

2. **Check logs for errors**
   ```bash
   make logs-api
   # Look for ERROR or Exception messages
   ```

3. **Check database connection**
   ```bash
   make logs-api | grep -i database
   ```

4. **Restart API**
   ```bash
   docker-compose -f docker-compose.dev.yml restart api
   ```

5. **Check system resources**
   ```bash
   docker stats
   # Look for high CPU or memory usage
   ```

### "Import error" or "Module not found"

**Problem:** Python import fails when starting API

**Solutions:**

1. **Check dependencies installed**
   ```bash
   docker-compose -f docker-compose.dev.yml exec api pip list
   ```

2. **Rebuild Docker image**
   ```bash
   docker-compose -f docker-compose.dev.yml build api --no-cache
   docker-compose -f docker-compose.dev.yml up api
   ```

3. **Check requirements.txt**
   ```bash
   cat plutsgrip-api/requirements.txt
   # Should include all imports used in code
   ```

4. **Install missing package**
   ```bash
   docker-compose -f docker-compose.dev.yml exec api pip install package_name
   # Add to requirements.txt for persistence
   ```

### "Syntax error" in Python code

**Problem:** API won't start, SyntaxError in logs

**Solutions:**

1. **Check Python syntax**
   ```bash
   python -m py_compile app/main.py
   ```

2. **Use linter**
   ```bash
   docker-compose -f docker-compose.dev.yml exec api flake8 app/
   docker-compose -f docker-compose.dev.yml exec api pylint app/
   ```

3. **Format code**
   ```bash
   docker-compose -f docker-compose.dev.yml exec api black app/
   ```

4. **Check for encoding issues**
   - Some editors save with BOM or wrong encoding
   - Resave file in UTF-8

### "504 Bad Gateway" (Production)

**Problem:** Nginx can't reach backend API

**Solutions:**

1. **Check API container**
   ```bash
   make status ENV=prod
   docker-compose -f docker-compose.prod.yml logs api
   ```

2. **Check Nginx configuration**
   ```bash
   docker-compose -f docker-compose.prod.yml exec nginx nginx -t
   # Check for config syntax errors
   ```

3. **Check network**
   ```bash
   docker network ls
   docker network inspect plutusgrip_network
   ```

4. **Restart services**
   ```bash
   make restart ENV=prod
   ```

---

## 📊 Performance Issues

### "Frontend loads slowly"

**Problem:** Page takes long time to display

**Solutions:**

1. **Check network tab**
   - DevTools → Network → Waterfall view
   - Identify slow requests
   - Check API response times

2. **Bundle analysis**
   ```bash
   npm run build
   npm run analyze  # If available
   ```

3. **Optimize images**
   - Use WebP format where possible
   - Compress images
   - Lazy load images

4. **Enable caching**
   - Set Cache-Control headers in Nginx
   - Use browser cache
   - Implement service workers

### "API responds slowly"

**Problem:** API requests take >1000ms

**Solutions:**

1. **Profile slow endpoints**
   ```bash
   make logs-api
   # Look for slow query logs
   ```

2. **Check database queries**
   ```bash
   # Add to endpoint to see query time
   from sqlalchemy import event
   ```

3. **Add indexes to database**
   ```bash
   CREATE INDEX idx_user_id ON transactions(user_id);
   ```

4. **Optimize N+1 queries**
   ```python
   # Bad: N+1 queries
   for transaction in transactions:
       category = session.get(Category, transaction.category_id)

   # Good: Single query with join
   query = select(Transaction).options(joinedload(Transaction.category))
   ```

---

## 🆘 Getting More Help

### Enable Debug Mode

**Backend:**
```bash
# In .env.dev
DEBUG=true
LOG_LEVEL=DEBUG
```

```bash
# Restart API
make logs-api
```

**Frontend:**
```bash
# In .env
VITE_DEBUG=true
```

### Collect Diagnostics

```bash
# System info
docker --version
docker-compose --version
python --version
node --version

# Project status
make status

# Logs
make logs > project-logs.txt

# Database info
make shell-db -c "SELECT version();"
```

### Report Issues

1. **Check existing issues** on GitHub
2. **Create detailed issue with:**
   - Exact error message
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (OS, Docker version, etc.)
   - Logs from `make logs`

---

## 📚 Related Documentation

- [06-DOCKER-SETUP.md](06-DOCKER-SETUP.md) - Docker troubleshooting
- [FAQ.md](FAQ.md) - Common questions
- [SETUP.md](../SETUP.md) - Environment setup
- [07-DEVELOPMENT.md](07-DEVELOPMENT.md) - Development guide

---

**Last Updated:** November 2025 | Status: Complete
