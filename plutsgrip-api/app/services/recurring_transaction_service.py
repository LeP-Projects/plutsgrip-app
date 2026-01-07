"""
Serviço de Transações Recorrentes com lógica de negócios
"""
from typing import List, Optional
from datetime import date, datetime, timedelta
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.recurring_transaction import RecurringTransaction, RecurrenceFrequency
from app.models.transaction import Transaction
from app.models.category import TransactionType
from app.repositories.recurring_transaction_repository import RecurringTransactionRepository


class RecurringTransactionService:
    """Serviço para lógica de transações recorrentes"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = RecurringTransactionRepository(db)

    async def create_recurring_transaction(
        self,
        user_id: int,
        description: str,
        amount: Decimal,
        currency: Optional[str],
        type: str,
        category_id: Optional[int],
        frequency: str,
        start_date: date,
        end_date: Optional[date] = None,
        notes: Optional[str] = None
    ) -> RecurringTransaction:
        """
        Cria uma transação recorrente

        Args:
            user_id: ID do usuário
            description: Descrição
            amount: Valor
            currency: Moeda
            type: Tipo (income ou expense)
            category_id: ID da categoria
            frequency: Frequência
            start_date: Data de início
            end_date: Data de término (opcional)
            notes: Notas

        Returns:
            Transação recorrente criada
        """
        # Convert strings to enums
        type_enum = TransactionType(type.lower()) if isinstance(type, str) else type
        frequency_enum = RecurrenceFrequency(frequency.lower()) if isinstance(frequency, str) else frequency
        
        next_execution_date = self._calculate_next_execution(start_date, frequency_enum.value)

        recurring_data = {
            "user_id": user_id,
            "description": description,
            "amount": amount,
            "currency": currency,
            "type": type_enum,
            "category_id": category_id,
            "frequency": frequency_enum,
            "start_date": start_date,
            "end_date": end_date,
            "next_execution_date": next_execution_date,
            "notes": notes
        }
        recurring = await self.repo.create(recurring_data)
        await self.db.commit()
        return recurring

    async def get_recurring_transaction(
        self,
        recurring_id: int,
        user_id: int
    ) -> Optional[RecurringTransaction]:
        """Obtém uma transação recorrente"""
        recurring = await self.repo.get_by_id(recurring_id)
        if recurring and recurring.user_id == user_id:
            return recurring
        return None

    async def get_user_recurring_transactions(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 100,
        is_active: Optional[bool] = None
    ) -> List[RecurringTransaction]:
        """Obtém transações recorrentes do usuário"""
        return await self.repo.get_by_user_id(user_id, skip, limit, is_active)

    async def update_recurring_transaction(
        self,
        recurring_id: int,
        user_id: int,
        **kwargs
    ) -> Optional[RecurringTransaction]:
        """Atualiza uma transação recorrente"""
        recurring = await self.get_recurring_transaction(recurring_id, user_id)
        if not recurring:
            return None

        updated = await self.repo.update(recurring_id, kwargs)
        await self.db.commit()
        return updated

    async def delete_recurring_transaction(self, recurring_id: int, user_id: int) -> bool:
        """Deleta uma transação recorrente"""
        recurring = await self.get_recurring_transaction(recurring_id, user_id)
        if not recurring:
            return False

        await self.repo.delete(recurring_id)
        await self.db.commit()
        return True

    async def execute_due_recurring_transactions(self) -> int:
        """
        Executa transações recorrentes vencidas
        Deve ser chamado por um job/scheduler

        Returns:
            Número de transações criadas
        """
        today = date.today()
        due_transactions = await self.repo.get_due_for_execution(today)
        created_count = 0

        for recurring in due_transactions:
            # Verifica se deve parar (end_date passou)
            if recurring.end_date and today > recurring.end_date:
                await self.repo.update(recurring.id, {"is_active": False})
                continue

            # Cria transação normal a partir da recorrente
            transaction_data = {
                "user_id": recurring.user_id,
                "description": recurring.description,
                "amount": recurring.amount,
                "currency": recurring.currency,
                "date": today,
                "type": recurring.type,
                "category_id": recurring.category_id,
                "notes": f"[Automática] {recurring.notes}" if recurring.notes else "[Automática]",
                "is_recurring": True,
                "recurring_transaction_id": recurring.id
            }

            transaction = Transaction(**transaction_data)
            self.db.add(transaction)

            # Atualiza próxima data de execução
            next_date = self._calculate_next_execution(
                recurring.next_execution_date,
                recurring.frequency
            )
            await self.repo.update(recurring.id, {"next_execution_date": next_date})

            created_count += 1

        await self.db.commit()
        return created_count

    def _calculate_next_execution(self, current_date: date, frequency: str) -> date:
        """
        Calcula a próxima data de execução baseado na frequência

        Args:
            current_date: Data atual
            frequency: Frequência

        Returns:
            Próxima data de execução
        """
        if frequency == RecurrenceFrequency.DAILY.value:
            return current_date + timedelta(days=1)
        elif frequency == RecurrenceFrequency.WEEKLY.value:
            return current_date + timedelta(weeks=1)
        elif frequency == RecurrenceFrequency.BIWEEKLY.value:
            return current_date + timedelta(weeks=2)
        elif frequency == RecurrenceFrequency.MONTHLY.value:
            # Avança um mês mantendo o dia
            next_date = current_date.replace(month=current_date.month + 1)
            if next_date.month == 1:  # Se passou de dezembro
                next_date = next_date.replace(year=next_date.year + 1)
            return next_date
        elif frequency == RecurrenceFrequency.QUARTERLY.value:
            return current_date + timedelta(days=91)  # Aproximadamente 3 meses
        elif frequency == RecurrenceFrequency.YEARLY.value:
            return current_date.replace(year=current_date.year + 1)
        else:
            return current_date + timedelta(days=1)  # Padrão: diário
