"""
Transaction service for business logic
"""
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.transaction import Transaction
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.transaction import TransactionCreateRequest, TransactionUpdateRequest


class TransactionService:
    """Service for transaction business logic"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.transaction_repo = TransactionRepository(db)

    async def create_transaction(
        self,
        user_id: int,
        transaction_data: TransactionCreateRequest
    ) -> Transaction:
        """
        Create a new transaction

        Args:
            user_id: ID of user creating the transaction
            transaction_data: Transaction data

        Returns:
            Created transaction object

        TODO: Implement full creation logic with validation
        """
        transaction_dict = {
            "user_id": user_id,
            **transaction_data.model_dump()
        }

        transaction = await self.transaction_repo.create(transaction_dict)
        await self.db.commit()

        return transaction

    async def get_user_transactions(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        transaction_type: Optional[str] = None,
        category_id: Optional[int] = None
    ) -> List[Transaction]:
        """
        Get transactions for a user with filters

        Args:
            user_id: User ID
            skip: Pagination offset
            limit: Page size
            transaction_type: Optional type filter
            category_id: Optional category filter

        Returns:
            List of transactions

        TODO: Implement filtering logic
        """
        return await self.transaction_repo.get_by_user_id(
            user_id=user_id,
            skip=skip,
            limit=limit,
            transaction_type=transaction_type,
            category_id=category_id
        )

    async def update_transaction(
        self,
        transaction_id: int,
        user_id: int,
        transaction_data: TransactionUpdateRequest
    ) -> Optional[Transaction]:
        """
        Update a transaction

        Args:
            transaction_id: Transaction ID
            user_id: User ID (for authorization)
            transaction_data: Updated data

        Returns:
            Updated transaction or None

        TODO: Implement update logic with authorization check
        """
        # Check if transaction belongs to user
        transaction = await self.transaction_repo.get_by_id(transaction_id)
        if not transaction or transaction.user_id != user_id:
            return None

        # Update only provided fields
        update_dict = transaction_data.model_dump(exclude_unset=True)
        updated_transaction = await self.transaction_repo.update(transaction_id, update_dict)
        await self.db.commit()

        return updated_transaction

    async def delete_transaction(self, transaction_id: int, user_id: int) -> bool:
        """
        Delete a transaction

        Args:
            transaction_id: Transaction ID
            user_id: User ID (for authorization)

        Returns:
            True if deleted, False otherwise

        Performs authorization check to ensure user owns the transaction
        """
        transaction = await self.transaction_repo.get_by_id(transaction_id)
        if not transaction or transaction.user_id != user_id:
            return False

        return await self.transaction_repo.delete(transaction_id)

    async def get_transaction_by_id(
        self,
        transaction_id: int,
        user_id: int
    ) -> Optional[Transaction]:
        """
        Get a transaction by ID with authorization check

        Args:
            transaction_id: Transaction ID
            user_id: User ID (for authorization)

        Returns:
            Transaction if found and belongs to user, None otherwise
        """
        transaction = await self.transaction_repo.get_by_id(transaction_id)
        if not transaction or transaction.user_id != user_id:
            return None

        return transaction

    async def get_transactions_by_date_range(
        self,
        user_id: int,
        start_date,
        end_date
    ) -> List[Transaction]:
        """
        Get transactions within a date range

        Args:
            user_id: User ID
            start_date: Start date
            end_date: End date

        Returns:
            List of transactions in date range
        """
        return await self.transaction_repo.get_by_date_range(user_id, start_date, end_date)

    async def calculate_totals(
        self,
        user_id: int,
        start_date=None,
        end_date=None
    ) -> dict:
        """
        Calculate total income and expenses for a user

        Args:
            user_id: User ID
            start_date: Optional start date for range
            end_date: Optional end date for range

        Returns:
            Dictionary with total_income, total_expense, and balance
        """
        if start_date and end_date:
            transactions = await self.get_transactions_by_date_range(user_id, start_date, end_date)
        else:
            transactions = await self.transaction_repo.get_by_user_id(user_id, skip=0, limit=10000)

        total_income = sum(
            float(t.amount) for t in transactions if t.type.value == "income"
        )
        total_expense = sum(
            float(t.amount) for t in transactions if t.type.value == "expense"
        )

        return {
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": total_income - total_expense
        }
