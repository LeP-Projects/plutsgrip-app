"""
Transaction repository for database operations
"""
from typing import List, Optional
from datetime import date
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.transaction import Transaction
from app.models.category import TransactionType
from app.repositories.base_repository import BaseRepository


class TransactionRepository(BaseRepository[Transaction]):
    """Repository for Transaction model operations"""

    def __init__(self, db: AsyncSession):
        super().__init__(Transaction, db)

    async def get_by_user_id(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 100,
        transaction_type: Optional[TransactionType] = None,
        category_id: Optional[int] = None
    ) -> List[Transaction]:
        """
        Get transactions for a specific user with optional filters

        Args:
            user_id: User ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            transaction_type: Optional filter by type (income/expense)
            category_id: Optional filter by category

        Returns:
            List of transactions
        """
        query = select(Transaction).where(Transaction.user_id == user_id)

        if transaction_type:
            query = query.where(Transaction.type == transaction_type)

        if category_id:
            query = query.where(Transaction.category_id == category_id)

        query = query.order_by(Transaction.date.desc()).offset(skip).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_date_range(
        self,
        user_id: int,
        start_date: date,
        end_date: date
    ) -> List[Transaction]:
        """
        Get transactions within a date range

        Args:
            user_id: User ID
            start_date: Start date
            end_date: End date

        Returns:
            List of transactions
        """
        query = select(Transaction).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.date >= start_date,
                Transaction.date <= end_date
            )
        ).order_by(Transaction.date.desc())

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_by_user(self, user_id: int) -> int:
        """Count transactions for a specific user"""
        from sqlalchemy import func
        result = await self.db.execute(
            select(func.count(Transaction.id)).where(Transaction.user_id == user_id)
        )
        return result.scalar() or 0

    # TODO: Implement additional transaction-specific queries
    # Examples:
    # - get_total_by_type(user_id, type)
    # - get_transactions_by_category(user_id, category_id)
    # - get_recent_transactions(user_id, days)
