# ============================================================
# PLUTUSGRIP API - PRODUCTION DOCKERFILE
# ============================================================
# Multi-stage build for optimized production image
# Base: Python 3.11 slim
# Features: Non-root user, multi-worker gunicorn, health checks
# ============================================================

# ==================== STAGE 1: BUILDER ====================
FROM python:3.11-slim AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies including gunicorn
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir gunicorn

# ==================== STAGE 2: RUNTIME ====================
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    APP_HOME=/app

# Set working directory
WORKDIR $APP_HOME

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p logs && chmod 755 logs

# Create non-root user
RUN useradd -m -u 1000 -s /bin/bash plutusgrip && \
    chown -R plutusgrip:plutusgrip $APP_HOME

# Switch to non-root user
USER plutusgrip

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Production command with gunicorn
# - Run migrations before starting server
# - 4 workers (adjust based on CPU cores: 2-4 x $(NUM_CORES))
# - uvicorn.workers.UvicornWorker for async support
# - 120s timeout for long-running requests
# - 30s graceful timeout for clean shutdown
# - Access logs to stdout, error logs to stderr
CMD ["sh", "-c", "alembic upgrade head && gunicorn -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --timeout 120 --graceful-timeout 30 --access-logfile - --error-logfile - --log-level info main:app"]
