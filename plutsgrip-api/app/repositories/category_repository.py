"""
Category repository for database operations
"""
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.category import Category, TransactionType
from app.repositories.base_repository import BaseRepository


class CategoryRepository(BaseRepository[Category]):
    """Repository for Category model operations"""

    def __init__(self, db: AsyncSession):
        super().__init__(Category, db)

    async def get_by_type(self, transaction_type: TransactionType) -> List[Category]:
        """
        Get categories by transaction type

        Args:
            transaction_type: Type of transaction (income or expense)

        Returns:
            List of categories
        """
        result = await self.db.execute(
            select(Category).where(Category.type == transaction_type)
        )
        return list(result.scalars().all())

    async def get_by_name(self, name: str) -> Optional[Category]:
        """
        Get category by name

        Args:
            name: Category name

        Returns:
            Category object or None
        """
        result = await self.db.execute(select(Category).where(Category.name == name))
        return result.scalars().first()

    # TODO: Implement additional category-specific queries
    # Examples:
    # - search_categories(search_term)
    # - get_popular_categories(user_id)
