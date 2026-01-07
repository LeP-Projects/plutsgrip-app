"""
Repositório de Orçamento para operações com banco de dados
"""
from typing import List, Optional
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.budget import Budget
from app.repositories.base_repository import BaseRepository


class BudgetRepository(BaseRepository[Budget]):
    """Repositório para operações do modelo Budget"""

    def __init__(self, db: AsyncSession):
        super().__init__(Budget, db)

    async def create(self, obj_in: dict) -> Budget:
        """
        Create a new budget with relationships loaded

        Overrides base class to ensure relationships are loaded with selectinload
        to avoid greenlet issues in async context when Pydantic validates the response

        Args:
            obj_in: Dictionary with budget data

        Returns:
            Budget object with all relationships loaded
        """
        # Create the budget using base method (insert + flush)
        budget = await super().create(obj_in)

        # Reload with relationships using get_by_id which has selectinload
        return await self.get_by_id(budget.id)

    async def get_by_id(self, id: int) -> Optional[Budget]:
        """
        Get a single budget by ID with relationships loaded

        Overrides base class to ensure relationships are loaded with selectinload
        to avoid greenlet issues in async context
        """
        query = select(Budget).options(
            selectinload(Budget.category),
            selectinload(Budget.user)
        ).where(Budget.id == id)

        result = await self.db.execute(query)
        return result.scalars().first()

    async def get_by_user_id(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Budget]:
        """
        Obtém orçamentos de um usuário específico com relacionamentos carregados

        Args:
            user_id: ID do usuário
            skip: Número de registros a pular
            limit: Limite máximo de registros

        Returns:
            Lista de orçamentos com relacionamentos carregados
        """
        query = select(Budget).options(
            selectinload(Budget.category),
            selectinload(Budget.user)
        ).where(Budget.user_id == user_id).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_user_and_category(
        self,
        user_id: int,
        category_id: int
    ) -> Optional[Budget]:
        """
        Obtém orçamento de um usuário para uma categoria específica com relacionamentos carregados

        Args:
            user_id: ID do usuário
            category_id: ID da categoria

        Returns:
            Orçamento ou None
        """
        query = select(Budget).options(
            selectinload(Budget.category),
            selectinload(Budget.user)
        ).where(
            and_(
                Budget.user_id == user_id,
                Budget.category_id == category_id
            )
        )
        result = await self.db.execute(query)
        return result.scalars().first()

    async def count_by_user(self, user_id: int) -> int:
        """Conta orçamentos para um usuário específico"""
        from sqlalchemy import func
        result = await self.db.execute(
            select(func.count(Budget.id)).where(Budget.user_id == user_id)
        )
        return result.scalar() or 0
