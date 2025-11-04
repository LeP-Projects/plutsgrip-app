"""
Serviço de Metas Financeiras com lógica de negócios
"""
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.goal import Goal
from app.repositories.goal_repository import GoalRepository


class GoalService:
    """Serviço para lógica de metas financeiras"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = GoalRepository(db)

    async def create_goal(
        self,
        user_id: int,
        name: str,
        target_amount: Decimal,
        description: Optional[str] = None,
        deadline: Optional[date] = None,
        category: Optional[str] = None,
        priority: str = "medium",
        current_amount: Decimal = Decimal("0.00")
    ) -> Goal:
        """
        Cria uma nova meta

        Args:
            user_id: ID do usuário
            name: Nome da meta
            target_amount: Valor alvo
            description: Descrição (opcional)
            deadline: Data limite (opcional)
            category: Categoria da meta (opcional)
            priority: Prioridade (low, medium, high)
            current_amount: Valor atual (padrão: 0)

        Returns:
            Meta criada
        """
        goal_data = {
            "user_id": user_id,
            "name": name,
            "target_amount": target_amount,
            "current_amount": current_amount,
            "description": description,
            "deadline": deadline,
            "category": category,
            "priority": priority
        }
        goal = await self.repo.create(goal_data)
        await self.db.commit()
        return goal

    async def get_goal(self, goal_id: int, user_id: int) -> Optional[Goal]:
        """Obtém uma meta específica"""
        goal = await self.repo.get_by_id(goal_id)
        if goal and goal.user_id == user_id:
            return goal
        return None

    async def get_user_goals(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 100,
        is_completed: Optional[bool] = None
    ) -> List[Goal]:
        """Obtém metas do usuário"""
        return await self.repo.get_by_user_id(user_id, skip, limit, is_completed)

    async def get_goals_by_priority(
        self,
        user_id: int,
        priority: str
    ) -> List[Goal]:
        """Obtém metas por prioridade"""
        return await self.repo.get_by_priority(user_id, priority)

    async def update_goal(
        self,
        goal_id: int,
        user_id: int,
        **kwargs
    ) -> Optional[Goal]:
        """Atualiza uma meta"""
        goal = await self.get_goal(goal_id, user_id)
        if not goal:
            return None

        updated = await self.repo.update(goal_id, kwargs)
        await self.db.commit()
        return updated

    async def add_progress(
        self,
        goal_id: int,
        user_id: int,
        amount: Decimal
    ) -> Optional[Goal]:
        """
        Adiciona progresso a uma meta

        Args:
            goal_id: ID da meta
            user_id: ID do usuário
            amount: Valor a adicionar

        Returns:
            Meta atualizada ou None
        """
        goal = await self.get_goal(goal_id, user_id)
        if not goal:
            return None

        new_amount = goal.current_amount + amount
        is_completed = new_amount >= goal.target_amount

        updated = await self.repo.update(
            goal_id,
            {
                "current_amount": new_amount,
                "is_completed": is_completed
            }
        )
        await self.db.commit()
        return updated

    async def mark_as_completed(self, goal_id: int, user_id: int) -> Optional[Goal]:
        """Marca uma meta como concluída"""
        goal = await self.get_goal(goal_id, user_id)
        if not goal:
            return None

        updated = await self.repo.update(goal_id, {"is_completed": True})
        await self.db.commit()
        return updated

    async def delete_goal(self, goal_id: int, user_id: int) -> bool:
        """Deleta uma meta"""
        goal = await self.get_goal(goal_id, user_id)
        if not goal:
            return False

        await self.repo.delete(goal_id)
        await self.db.commit()
        return True

    async def get_goal_progress_summary(self, user_id: int) -> dict:
        """
        Obtém resumo de progresso das metas do usuário

        Args:
            user_id: ID do usuário

        Returns:
            Dicionário com resumo
        """
        total = await self.repo.count_by_user(user_id)
        completed = await self.repo.count_completed_by_user(user_id)

        return {
            "total_goals": total,
            "completed_goals": completed,
            "pending_goals": total - completed,
            "completion_percentage": (completed / total * 100) if total > 0 else 0
        }
