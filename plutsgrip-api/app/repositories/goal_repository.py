"""
Repositório de Metas para operações com banco de dados
"""
from typing import List, Optional
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.goal import Goal
from app.repositories.base_repository import BaseRepository


class GoalRepository(BaseRepository[Goal]):
    """Repositório para operações do modelo Goal"""

    def __init__(self, db: AsyncSession):
        super().__init__(Goal, db)

    async def get_by_user_id(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 100,
        is_completed: Optional[bool] = None
    ) -> List[Goal]:
        """
        Obtém metas de um usuário

        Args:
            user_id: ID do usuário
            skip: Número de registros a pular
            limit: Limite máximo de registros
            is_completed: Filtrar por status (opcional)

        Returns:
            Lista de metas
        """
        query = select(Goal).where(Goal.user_id == user_id)

        if is_completed is not None:
            query = query.where(Goal.is_completed == is_completed)

        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_priority(
        self,
        user_id: int,
        priority: str
    ) -> List[Goal]:
        """
        Obtém metas de um usuário por prioridade

        Args:
            user_id: ID do usuário
            priority: Prioridade (low, medium, high)

        Returns:
            Lista de metas
        """
        query = select(Goal).where(
            and_(
                Goal.user_id == user_id,
                Goal.priority == priority
            )
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_by_user(self, user_id: int) -> int:
        """Conta metas para um usuário"""
        from sqlalchemy import func
        result = await self.db.execute(
            select(func.count(Goal.id)).where(Goal.user_id == user_id)
        )
        return result.scalar() or 0

    async def count_completed_by_user(self, user_id: int) -> int:
        """Conta metas completadas para um usuário"""
        from sqlalchemy import func
        result = await self.db.execute(
            select(func.count(Goal.id)).where(
                and_(
                    Goal.user_id == user_id,
                    Goal.is_completed == True
                )
            )
        )
        return result.scalar() or 0
