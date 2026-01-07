"""
Serviço de relatórios para dashboard e resumos financeiros
"""
from typing import Optional, Dict, List
from datetime import date, datetime, timedelta
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.repositories.transaction_repository import TransactionRepository
from app.models.transaction import Transaction
from app.models.category import TransactionType, Category


class ReportService:
    """Serviço para gerar relatórios e estatísticas"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.transaction_repo = TransactionRepository(db)

    async def get_dashboard_summary(self, user_id: int) -> dict:
        """
        Obtém resumo do dashboard com totais e contagens

        Args:
            user_id: ID do usuário

        Returns:
            Dicionário com dados do dashboard
        """
        # Consulta para renda total
        income_result = await self.db.execute(
            select(func.sum(Transaction.amount)).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.type == TransactionType.INCOME
                )
            )
        )
        total_income = income_result.scalar() or Decimal("0.00")

        # Consulta para despesa total
        expense_result = await self.db.execute(
            select(func.sum(Transaction.amount)).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.type == TransactionType.EXPENSE
                )
            )
        )
        total_expense = expense_result.scalar() or Decimal("0.00")

        # Consulta para contagem de transações por tipo
        income_count_result = await self.db.execute(
            select(func.count(Transaction.id)).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.type == TransactionType.INCOME
                )
            )
        )
        income_count = income_count_result.scalar() or 0

        expense_count_result = await self.db.execute(
            select(func.count(Transaction.id)).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.type == TransactionType.EXPENSE
                )
            )
        )
        expense_count = expense_count_result.scalar() or 0

        return {
            "total_income": float(total_income),
            "total_expense": float(total_expense),
            "balance": float(total_income - total_expense),
            "transaction_count": income_count + expense_count,
            "income_count": income_count,
            "expense_count": expense_count
        }

    async def get_financial_summary(
        self,
        user_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> dict:
        """
        Obtém resumo financeiro detalhado para um período

        Args:
            user_id: ID do usuário
            start_date: Data inicial (padrão: primeiro dia do mês atual)
            end_date: Data final (padrão: hoje)

        Returns:
            Dicionário com resumo financeiro
        """
        if not start_date:
            start_date = datetime.now().replace(day=1).date()
        if not end_date:
            end_date = datetime.now().date()

        # Renda total no período
        income_result = await self.db.execute(
            select(func.sum(Transaction.amount)).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.type == TransactionType.INCOME,
                    Transaction.date >= start_date,
                    Transaction.date <= end_date
                )
            )
        )
        total_income = income_result.scalar() or Decimal("0.00")

        # Despesa total no período
        expense_result = await self.db.execute(
            select(func.sum(Transaction.amount)).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.type == TransactionType.EXPENSE,
                    Transaction.date >= start_date,
                    Transaction.date <= end_date
                )
            )
        )
        total_expense = expense_result.scalar() or Decimal("0.00")

        # Contagem de transações
        count_result = await self.db.execute(
            select(func.count(Transaction.id)).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.date >= start_date,
                    Transaction.date <= end_date
                )
            )
        )
        transaction_count = count_result.scalar() or 0

        # Renda por categoria
        income_by_cat = await self._get_totals_by_category(
            user_id, TransactionType.INCOME, start_date, end_date
        )

        # Despesa por categoria
        expense_by_cat = await self._get_totals_by_category(
            user_id, TransactionType.EXPENSE, start_date, end_date
        )

        # Totais diários
        daily_totals = await self._get_daily_totals(user_id, start_date, end_date)

        return {
            "period_start": start_date.isoformat(),
            "period_end": end_date.isoformat(),
            "total_income": float(total_income),
            "total_expense": float(total_expense),
            "net_balance": float(total_income - total_expense),
            "transaction_count": transaction_count,
            "income_by_category": income_by_cat,
            "expense_by_category": expense_by_cat,
            "daily_totals": daily_totals
        }

    async def get_category_breakdown(
        self,
        user_id: int,
        transaction_type: TransactionType,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> list:
        """
        Obtém detalhamento de categorias

        Args:
            user_id: ID do usuário
            transaction_type: Tipo de transação (INCOME ou EXPENSE)
            start_date: Data inicial
            end_date: Data final

        Returns:
            Lista com detalhamento por categoria
        """
        if not start_date:
            start_date = datetime.now().replace(day=1).date()
        if not end_date:
            end_date = datetime.now().date()

        return await self._get_totals_by_category(
            user_id, transaction_type, start_date, end_date
        )

    async def get_monthly_trends(
        self,
        user_id: int,
        months: int = 6
    ) -> dict:
        """
        Obtém tendências mensais de renda e despesa

        Args:
            user_id: ID do usuário
            months: Número de meses anteriores a considerar

        Returns:
            Dicionário com tendências mensais
        """
        trends = {
            "income": [],
            "expense": [],
            "balance": []
        }

        end_date = datetime.now().date()

        for i in range(months - 1, -1, -1):
            # Calcula primeiro e último dia do mês
            current_date = end_date - timedelta(days=i * 30)
            month_start = current_date.replace(day=1)

            if i == 0:
                month_end = end_date
            else:
                next_month = current_date.replace(day=1) + timedelta(days=32)
                month_end = next_month.replace(day=1) - timedelta(days=1)

            # Renda do mês
            income_result = await self.db.execute(
                select(func.sum(Transaction.amount)).where(
                    and_(
                        Transaction.user_id == user_id,
                        Transaction.type == TransactionType.INCOME,
                        Transaction.date >= month_start,
                        Transaction.date <= month_end
                    )
                )
            )
            income = income_result.scalar() or Decimal("0.00")

            # Despesa do mês
            expense_result = await self.db.execute(
                select(func.sum(Transaction.amount)).where(
                    and_(
                        Transaction.user_id == user_id,
                        Transaction.type == TransactionType.EXPENSE,
                        Transaction.date >= month_start,
                        Transaction.date <= month_end
                    )
                )
            )
            expense = expense_result.scalar() or Decimal("0.00")

            month_label = month_start.strftime("%b/%Y")
            trends["income"].append({
                "month": month_label,
                "value": float(income)
            })
            trends["expense"].append({
                "month": month_label,
                "value": float(expense)
            })
            trends["balance"].append({
                "month": month_label,
                "value": float(income - expense)
            })

        return trends

    async def get_spending_patterns(self, user_id: int) -> dict:
        """
        Obtém padrões de gastos

        Args:
            user_id: ID do usuário

        Returns:
            Dicionário com padrões de gastos
        """
        # Categorias com mais gastos (últimos 30 dias)
        thirty_days_ago = datetime.now().date() - timedelta(days=30)

        top_categories = await self.db.execute(
            select(
                Category.name,
                func.sum(Transaction.amount).label("total")
            ).join(Transaction).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.type == TransactionType.EXPENSE,
                    Transaction.date >= thirty_days_ago
                )
            ).group_by(Category.id, Category.name).order_by(
                func.sum(Transaction.amount).desc()
            ).limit(5)
        )

        top_cats = [
            {"category": row[0], "total": float(row[1])}
            for row in top_categories.all()
        ]

        # Gasto médio diário
        all_expense_result = await self.db.execute(
            select(func.sum(Transaction.amount)).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.type == TransactionType.EXPENSE,
                    Transaction.date >= thirty_days_ago
                )
            )
        )
        total_expense = all_expense_result.scalar() or Decimal("0.00")
        avg_daily = float(total_expense) / 30

        return {
            "top_expense_categories": top_cats,
            "average_daily_spending": round(avg_daily, 2),
            "period_days": 30
        }

    async def _get_totals_by_category(
        self,
        user_id: int,
        transaction_type: TransactionType,
        start_date: date,
        end_date: date
    ) -> list:
        """
        Obtém totais agrupados por categoria

        Args:
            user_id: ID do usuário
            transaction_type: Tipo de transação
            start_date: Data inicial
            end_date: Data final

        Returns:
            Lista com totais por categoria
        """
        result = await self.db.execute(
            select(
                Category.id,
                Category.name,
                func.sum(Transaction.amount).label("total"),
                func.count(Transaction.id).label("count")
            ).join(Transaction).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.type == transaction_type,
                    Transaction.date >= start_date,
                    Transaction.date <= end_date
                )
            ).group_by(Category.id, Category.name).order_by(
                func.sum(Transaction.amount).desc()
            )
        )

        rows = result.all()

        # Calculate total amount for percentage calculation
        grand_total = sum(float(row[2]) for row in rows)

        return [
            {
                "category_id": row[0],
                "category_name": row[1],
                "total": float(row[2]),
                "count": row[3],
                "percentage": round((float(row[2]) / grand_total * 100) if grand_total > 0 else 0, 2)
            }
            for row in rows
        ]

    async def _get_daily_totals(
        self,
        user_id: int,
        start_date: date,
        end_date: date
    ) -> dict:
        """
        Obtém totais agrupados por dia

        Args:
            user_id: ID do usuário
            start_date: Data inicial
            end_date: Data final

        Returns:
            Dicionário com totais por dia
        """
        # Get income totals by day
        income_result = await self.db.execute(
            select(
                Transaction.date,
                func.sum(Transaction.amount).label("total")
            ).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.type == TransactionType.INCOME,
                    Transaction.date >= start_date,
                    Transaction.date <= end_date
                )
            ).group_by(Transaction.date)
        )
        income_by_date = {row[0].isoformat(): float(row[1]) for row in income_result.all()}

        # Get expense totals by day
        expense_result = await self.db.execute(
            select(
                Transaction.date,
                func.sum(Transaction.amount).label("total")
            ).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.type == TransactionType.EXPENSE,
                    Transaction.date >= start_date,
                    Transaction.date <= end_date
                )
            ).group_by(Transaction.date)
        )
        expense_by_date = {row[0].isoformat(): float(row[1]) for row in expense_result.all()}

        # Combine income and expense into daily totals
        all_dates = set(income_by_date.keys()) | set(expense_by_date.keys())

        return {
            date_str: {
                "income": Decimal(str(income_by_date.get(date_str, 0.0))),
                "expense": Decimal(str(expense_by_date.get(date_str, 0.0)))
            }
            for date_str in sorted(all_dates)
        }
