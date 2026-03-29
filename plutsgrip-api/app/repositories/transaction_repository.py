"""
Transaction repository for database operations
"""
from datetime import date
from typing import List, Optional

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.category import TransactionType
from app.models.transaction import Transaction
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
        category_id: Optional[int] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> List[Transaction]:
        """
        Get transactions for a specific user with optional filters
        """
        query = (
            select(Transaction)
            .options(selectinload(Transaction.category), selectinload(Transaction.user))
            .where(Transaction.user_id == user_id)
        )

        if transaction_type:
            query = query.where(Transaction.type == transaction_type)

        if category_id:
            query = query.where(Transaction.category_id == category_id)

        if start_date:
            query = query.where(Transaction.date >= start_date)

        if end_date:
            query = query.where(Transaction.date <= end_date)

        query = query.order_by(Transaction.date.desc()).offset(skip).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_date_range(
        self,
        user_id: int,
        start_date: date,
        end_date: date,
    ) -> List[Transaction]:
        """
        Get transactions within a date range
        """
        query = (
            select(Transaction)
            .options(selectinload(Transaction.category), selectinload(Transaction.user))
            .where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.date >= start_date,
                    Transaction.date <= end_date,
                )
            )
            .order_by(Transaction.date.desc())
        )

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create(self, obj_in: dict) -> Transaction:
        """
        Create a new transaction with relationships loaded
        """
        transaction = await super().create(obj_in)
        return await self.get_by_id(transaction.id)

    async def get_by_id(self, id: int) -> Optional[Transaction]:
        """
        Get a single transaction by ID with relationships loaded
        """
        query = (
            select(Transaction)
            .options(selectinload(Transaction.category), selectinload(Transaction.user))
            .where(Transaction.id == id)
        )

        result = await self.db.execute(query)
        return result.scalars().first()

    async def count_by_user(
        self,
        user_id: int,
        transaction_type: Optional[TransactionType] = None,
        category_id: Optional[int] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> int:
        """Count transactions for a specific user with optional filters"""
        query = select(func.count(Transaction.id)).where(Transaction.user_id == user_id)

        if transaction_type:
            query = query.where(Transaction.type == transaction_type)

        if category_id:
            query = query.where(Transaction.category_id == category_id)

        if start_date:
            query = query.where(Transaction.date >= start_date)

        if end_date:
            query = query.where(Transaction.date <= end_date)

        result = await self.db.execute(query)
        return result.scalar() or 0
