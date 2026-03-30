"""
Database configuration and session management
Uses SQLAlchemy 2.0 async engine
"""
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings
from app.core.database_url import normalize_async_database_url

# Convert a standard PostgreSQL URL into an asyncpg-compatible DSN.
DATABASE_URL = normalize_async_database_url(settings.DATABASE_URL)

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=settings.DATABASE_ECHO,
    future=True,
    pool_pre_ping=True,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE,
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for declarative models
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting async database sessions

    Usage in FastAPI endpoints:
        @app.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """
    Initialize database - Create all tables
    NOTE: In production, use Alembic migrations instead
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """Close database connections"""
    await engine.dispose()


async def remove_default_categories() -> None:
    """
    Remove legacy default categories from the database.
    """
    from sqlalchemy import delete
    from app.models.category import Category

    async with AsyncSessionLocal() as session:
        try:
            result = await session.execute(
                delete(Category).where(Category.is_default.is_(True))
            )
            await session.commit()
            print(f"Removed {result.rowcount or 0} legacy default categories")

        except Exception as e:
            await session.rollback()
            print(f"Error removing default categories: {e}")
