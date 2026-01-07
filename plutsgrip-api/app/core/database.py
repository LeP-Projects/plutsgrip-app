"""
Database configuration and session management
Uses SQLAlchemy 2.0 async engine
"""
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Convert postgresql:// to postgresql+asyncpg:// for async support
DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=settings.DATABASE_ECHO,
    future=True,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
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


async def seed_default_categories() -> None:
    """
    Seed database with default categories
    Creates default categories if they don't exist
    """
    from sqlalchemy import select
    from app.models.category import Category, TransactionType

    async with AsyncSessionLocal() as session:
        try:
            # Check if default categories already exist
            result = await session.execute(
                select(Category).where(Category.is_default == True).limit(1)
            )
            existing = result.scalars().first()

            if existing:
                print("Default categories already exist, skipping seed")
                return

            # Default categories
            default_categories = [
                # Expense categories
                Category(
                    name="Alimentação",
                    type=TransactionType.EXPENSE,
                    color="#FF6B6B",
                    icon="utensils",
                    is_default=True
                ),
                Category(
                    name="Transporte",
                    type=TransactionType.EXPENSE,
                    color="#4ECDC4",
                    icon="car",
                    is_default=True
                ),
                Category(
                    name="Compras",
                    type=TransactionType.EXPENSE,
                    color="#FFE66D",
                    icon="shopping-bag",
                    is_default=True
                ),
                Category(
                    name="Entretenimento",
                    type=TransactionType.EXPENSE,
                    color="#A8D8EA",
                    icon="popcorn",
                    is_default=True
                ),
                Category(
                    name="Contas",
                    type=TransactionType.EXPENSE,
                    color="#95E1D3",
                    icon="lightbulb",
                    is_default=True
                ),
                Category(
                    name="Saúde",
                    type=TransactionType.EXPENSE,
                    color="#F38181",
                    icon="heart",
                    is_default=True
                ),
                Category(
                    name="Educação",
                    type=TransactionType.EXPENSE,
                    color="#AA96DA",
                    icon="book",
                    is_default=True
                ),
                Category(
                    name="Viagem",
                    type=TransactionType.EXPENSE,
                    color="#FCBAD3",
                    icon="plane",
                    is_default=True
                ),
                # Income categories
                Category(
                    name="Salário",
                    type=TransactionType.INCOME,
                    color="#5FD068",
                    icon="briefcase",
                    is_default=True
                ),
                Category(
                    name="Freelance",
                    type=TransactionType.INCOME,
                    color="#7CB9E8",
                    icon="laptop",
                    is_default=True
                ),
                Category(
                    name="Investimentos",
                    type=TransactionType.INCOME,
                    color="#F0C040",
                    icon="chart-line",
                    is_default=True
                ),
                Category(
                    name="Outras Rendas",
                    type=TransactionType.INCOME,
                    color="#9FB469",
                    icon="gift",
                    is_default=True
                ),
            ]

            # Add all categories
            session.add_all(default_categories)
            await session.commit()
            print(f"Successfully seeded {len(default_categories)} default categories")

        except Exception as e:
            await session.rollback()
            print(f"Error seeding default categories: {e}")
