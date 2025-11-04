"""
Category service for business logic
"""
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.category import Category, TransactionType
from app.repositories.category_repository import CategoryRepository


class CategoryService:
    """Service for category business logic"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.category_repo = CategoryRepository(db)

    async def get_all_categories(
        self,
        transaction_type: Optional[TransactionType] = None
    ) -> List[Category]:
        """
        Get all categories, optionally filtered by type

        Args:
            transaction_type: Optional type filter (income/expense)

        Returns:
            List of categories

        TODO: Implement filtering logic
        """
        if transaction_type:
            return await self.category_repo.get_by_type(transaction_type)

        return await self.category_repo.get_all()

    async def get_category_by_id(self, category_id: int) -> Optional[Category]:
        """
        Get a category by ID

        Args:
            category_id: Category ID

        Returns:
            Category object or None
        """
        return await self.category_repo.get_by_id(category_id)

    async def get_default_categories(self) -> List[Category]:
        """
        Get all default categories

        Returns:
            List of default categories
        """
        from sqlalchemy import select
        result = await self.db.execute(
            select(Category).where(Category.is_default == True).order_by(Category.type)
        )
        return list(result.scalars().all())
