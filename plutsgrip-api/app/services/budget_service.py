"""
Serviço de Orçamento com lógica de negócios
"""
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.budget import Budget, BudgetPeriod
from app.models.transaction import Transaction
from app.models.category import TransactionType
from app.repositories.budget_repository import BudgetRepository


class BudgetService:
    """Serviço para lógica de orçamentos"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = BudgetRepository(db)

    async def create_budget(
        self,
        user_id: int,
        category_id: int,
        amount: Decimal,
        period: str,
        start_date: datetime
    ) -> Budget:
        """
        Cria um novo orçamento

        Args:
            user_id: ID do usuário
            category_id: ID da categoria
            amount: Valor orçado
            period: Período do orçamento
            start_date: Data de início

        Returns:
            Orçamento criado
        """
        # Convert period string to enum
        period_enum = BudgetPeriod(period.lower()) if isinstance(period, str) else period
        
        budget_data = {
            "user_id": user_id,
            "category_id": category_id,
            "amount": amount,
            "period": period_enum,
            "start_date": start_date
        }
        budget = await self.repo.create(budget_data)
        await self.db.commit()
        return budget

    async def get_budget(self, budget_id: int, user_id: int) -> Optional[Budget]:
        """Obtém um orçamento específico"""
        budget = await self.repo.get_by_id(budget_id)
        if budget and budget.user_id == user_id:
            return budget
        return None

    async def get_user_budgets(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Budget]:
        """Obtém orçamentos do usuário"""
        return await self.repo.get_by_user_id(user_id, skip, limit)

    async def update_budget(
        self,
        budget_id: int,
        user_id: int,
        **kwargs
    ) -> Optional[Budget]:
        """Atualiza um orçamento"""
        budget = await self.get_budget(budget_id, user_id)
        if not budget:
            return None

        updated = await self.repo.update(budget_id, kwargs)
        await self.db.commit()
        return updated

    async def delete_budget(self, budget_id: int, user_id: int) -> bool:
        """Deleta um orçamento"""
        budget = await self.get_budget(budget_id, user_id)
        if not budget:
            return False

        await self.repo.delete(budget_id)
        await self.db.commit()
        return True

    async def get_budget_status(self, budget_id: int, user_id: int) -> Optional[dict]:
        """
        Obtém status do orçamento (gasto atual vs limite)

        Args:
            budget_id: ID do orçamento
            user_id: ID do usuário

        Returns:
            Dicionário com informações de status ou None
        """
        budget = await self.get_budget(budget_id, user_id)
        if not budget:
            return None

        # Calcula gasto total na categoria
        spent_result = await self.db.execute(
            select(func.sum(Transaction.amount)).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.category_id == budget.category_id,
                    Transaction.type == TransactionType.EXPENSE
                )
            )
        )
        spent = spent_result.scalar() or Decimal("0.00")

        remaining = budget.amount - spent
        percentage_used = float(spent / budget.amount * 100) if budget.amount > 0 else 0

        return {
            "budget_id": budget.id,
            "category_id": budget.category_id,
            "budget_amount": float(budget.amount),
            "spent_amount": float(spent),
            "remaining_amount": float(remaining),
            "percentage_used": min(percentage_used, 100),
            "is_exceeded": spent > budget.amount
        }
