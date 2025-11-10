"""
Repositório de Transações Recorrentes para operações com banco de dados
"""
from typing import List, Optional
from datetime import date
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.recurring_transaction import RecurringTransaction
from app.repositories.base_repository import BaseRepository


class RecurringTransactionRepository(BaseRepository[RecurringTransaction]):
    """Repositório para operações do modelo RecurringTransaction"""

    def __init__(self, db: AsyncSession):
        super().__init__(RecurringTransaction, db)

    async def get_by_id(self, id: int) -> Optional[RecurringTransaction]:
        """
        Get a single recurring transaction by ID with relationships loaded

        Overrides base class to ensure relationships are loaded with selectinload
        to avoid greenlet issues in async context
        """
        query = select(RecurringTransaction).options(
            selectinload(RecurringTransaction.category),
            selectinload(RecurringTransaction.user)
        ).where(RecurringTransaction.id == id)

        result = await self.db.execute(query)
        return result.scalars().first()

    async def get_by_user_id(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 100,
        is_active: Optional[bool] = None
    ) -> List[RecurringTransaction]:
        """
        Obtém transações recorrentes de um usuário com relacionamentos carregados

        Args:
            user_id: ID do usuário
            skip: Número de registros a pular
            limit: Limite máximo de registros
            is_active: Filtrar por status (opcional)

        Returns:
            Lista de transações recorrentes com relacionamentos carregados
        """
        query = select(RecurringTransaction).options(
            selectinload(RecurringTransaction.category),
            selectinload(RecurringTransaction.user)
        ).where(RecurringTransaction.user_id == user_id)

        if is_active is not None:
            query = query.where(RecurringTransaction.is_active == is_active)

        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_due_for_execution(self, current_date: date) -> List[RecurringTransaction]:
        """
        Obtém transações recorrentes que devem ser executadas hoje com relacionamentos carregados

        Args:
            current_date: Data atual

        Returns:
            Lista de transações vencidas para execução com relacionamentos carregados
        """
        query = select(RecurringTransaction).options(
            selectinload(RecurringTransaction.category),
            selectinload(RecurringTransaction.user)
        ).where(
            and_(
                RecurringTransaction.is_active == True,
                RecurringTransaction.next_execution_date <= current_date
            )
        ).order_by(RecurringTransaction.user_id)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_by_user(self, user_id: int) -> int:
        """Conta transações recorrentes para um usuário"""
        from sqlalchemy import func
        result = await self.db.execute(
            select(func.count(RecurringTransaction.id)).where(RecurringTransaction.user_id == user_id)
        )
        return result.scalar() or 0
