"""
PlutusGrip Finance Tracker API
Main application entry point
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from contextlib import asynccontextmanager
import time
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.logging import logger, log_info, log_error
from app.core.database import init_db, close_db, seed_default_categories, AsyncSessionLocal
from app.core.rate_limiter import limiter, update_whitelist_cache
from app.api.v1.router import api_router
from app.middlewares.error_handler import (
    validation_exception_handler,
    sqlalchemy_exception_handler,
    generic_exception_handler
)


async def sync_whitelist_cache() -> None:
    """Sync whitelist from database to in-memory cache"""
    from app.services.whitelist_service import WhitelistService
    
    async with AsyncSessionLocal() as session:
        try:
            service = WhitelistService(session)
            active_ips = await service.get_active_ips()
            update_whitelist_cache(active_ips)
            log_info(f"Synced {len(active_ips)} IPs to whitelist cache")
        except Exception as e:
            log_error(f"Failed to sync whitelist cache: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan events
    Handles startup and shutdown operations
    """
    # Startup
    log_info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    log_info(f"Environment: {settings.APP_ENV}")

    # Initialize database (optional - use Alembic migrations in production)
    if settings.APP_ENV == "development":
        log_info("Initializing database tables...")
        # await init_db()  # Uncomment if you want auto table creation in dev

    # Seed default categories
    log_info("Seeding default categories...")
    await seed_default_categories()
    
    # Sync whitelist cache from database
    log_info("Syncing rate limit whitelist...")
    await sync_whitelist_cache()

    log_info("Application startup complete")

    yield

    # Shutdown
    log_info("Shutting down application...")
    await close_db()
    log_info("Application shutdown complete")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="REST API for personal finance management",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)


# Rate Limiter (with whitelist support)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=settings.allowed_methods_list,
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all HTTP requests with timing"""
    start_time = time.time()

    # Process request
    response = await call_next(request)

    # Calculate duration
    duration = (time.time() - start_time) * 1000  # Convert to milliseconds

    # Log request
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Duration: {duration:.2f}ms"
    )

    return response


# Exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)


# Include API routes
app.include_router(api_router)


# Health check endpoint
@app.get("/health", tags=["System"])
async def health_check():
    """
    Health check endpoint for monitoring

    Returns application status and version
    """
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV
    }


# Root endpoint
@app.get("/", tags=["System"])
async def root():
    """
    Root endpoint with API information

    Provides basic information about the API
    """
    return {
        "message": "Welcome to PlutusGrip Finance Tracker API",
        "version": settings.APP_VERSION,
        "docs": "/docs" if settings.DEBUG else "Documentation disabled in production",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
