"""
Seed script for default categories
Run this script to populate the database with default categories

Usage:
    python scripts/seed_categories.py
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings
from app.models.category import Category, TransactionType
from app.core.database import Base


# Default categories to seed
DEFAULT_CATEGORIES = [
    # Income categories
    {"name": "Salário", "type": TransactionType.INCOME, "color": "#4CAF50", "icon": "money", "is_default": True},
    {"name": "Freelance", "type": TransactionType.INCOME, "color": "#4CAF50", "icon": "laptop", "is_default": True},
    {"name": "Investimentos", "type": TransactionType.INCOME, "color": "#4CAF50", "icon": "trending_up", "is_default": True},
    {"name": "Bônus", "type": TransactionType.INCOME, "color": "#4CAF50", "icon": "gift", "is_default": True},
    {"name": "Outros", "type": TransactionType.INCOME, "color": "#4CAF50", "icon": "more_horiz", "is_default": True},

    # Expense categories
    {"name": "Alimentação", "type": TransactionType.EXPENSE, "color": "#FF9800", "icon": "restaurant", "is_default": True},
    {"name": "Transporte", "type": TransactionType.EXPENSE, "color": "#2196F3", "icon": "directions_car", "is_default": True},
    {"name": "Moradia", "type": TransactionType.EXPENSE, "color": "#9C27B0", "icon": "home", "is_default": True},
    {"name": "Saúde", "type": TransactionType.EXPENSE, "color": "#F44336", "icon": "favorite", "is_default": True},
    {"name": "Educação", "type": TransactionType.EXPENSE, "color": "#3F51B5", "icon": "school", "is_default": True},
    {"name": "Diversão", "type": TransactionType.EXPENSE, "color": "#E91E63", "icon": "local_movies", "is_default": True},
    {"name": "Compras", "type": TransactionType.EXPENSE, "color": "#FF5722", "icon": "shopping_cart", "is_default": True},
    {"name": "Utilidades", "type": TransactionType.EXPENSE, "color": "#00BCD4", "icon": "build", "is_default": True},
    {"name": "Assinaturas", "type": TransactionType.EXPENSE, "color": "#673AB7", "icon": "subscriptions", "is_default": True},
    {"name": "Outros", "type": TransactionType.EXPENSE, "color": "#9E9E9E", "icon": "more_horiz", "is_default": True},
]


async def seed_categories():
    """Seed the database with default categories"""
    # Create engine
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False
    )

    # Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Create session
    async_session = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False
    )

    async with async_session() as session:
        try:
            # Check if categories already exist
            from sqlalchemy import select, func
            result = await session.execute(select(func.count(Category.id)))
            count = result.scalar() or 0

            if count > 0:
                print(f"✓ Database already has {count} categories. Skipping seed.")
                return

            # Create categories
            for category_data in DEFAULT_CATEGORIES:
                category = Category(**category_data)
                session.add(category)

            # Commit all categories
            await session.commit()
            print(f"✓ Successfully seeded {len(DEFAULT_CATEGORIES)} default categories")

        except Exception as e:
            await session.rollback()
            print(f"✗ Error seeding categories: {str(e)}")
            raise

        finally:
            await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_categories())
    print("✓ Seed completed successfully!")
