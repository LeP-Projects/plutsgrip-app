"""
Endpoints de Relatórios

GET /api/reports/dashboard - Resumo do dashboard
GET /api/reports/summary - Resumo financeiro detalhado com intervalo de datas
GET /api/reports/categories - Detalhamento por categoria
GET /api/reports/trends - Tendências mensais
GET /api/reports/patterns - Padrões de gastos
"""
from typing import Optional, List
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.category import TransactionType
from app.schemas.report import DashboardResponse, FinancialSummaryResponse
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Relatórios"])


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtém resumo do dashboard com estatísticas gerais

    Retorna:
    - total_income: Total de renda
    - total_expense: Total de despesa
    - balance: Saldo (renda - despesa)
    - transaction_count: Total de transações
    - income_count: Contagem de transações de renda
    - expense_count: Contagem de transações de despesa
    """
    report_service = ReportService(db)
    dashboard_data = await report_service.get_dashboard_summary(current_user.id)
    return DashboardResponse(**dashboard_data)


@router.get("/summary", response_model=FinancialSummaryResponse)
async def get_financial_summary(
    start_date: Optional[date] = Query(None, description="Data inicial do relatório"),
    end_date: Optional[date] = Query(None, description="Data final do relatório"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtém resumo financeiro detalhado para um intervalo de datas

    Parâmetros:
    - start_date: Data inicial (padrão: primeiro dia do mês atual)
    - end_date: Data final (padrão: hoje)

    Retorna:
    - period_start: Data de início do período
    - period_end: Data de fim do período
    - total_income: Total de renda no período
    - total_expense: Total de despesa no período
    - net_balance: Saldo líquido (renda - despesa)
    - transaction_count: Total de transações no período
    - income_by_category: Renda agrupada por categoria
    - expense_by_category: Despesa agrupada por categoria
    - daily_totals: Totais agrupados por dia
    """
    report_service = ReportService(db)
    summary_data = await report_service.get_financial_summary(
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date
    )
    return FinancialSummaryResponse(**summary_data)


@router.get("/categories")
async def get_category_breakdown(
    type: TransactionType = Query(..., description="Tipo de transação: INCOME ou EXPENSE"),
    start_date: Optional[date] = Query(None, description="Data inicial"),
    end_date: Optional[date] = Query(None, description="Data final"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtém detalhamento de totais por categoria

    Parâmetros:
    - type: Tipo de transação (INCOME ou EXPENSE)
    - start_date: Data inicial (padrão: primeiro dia do mês atual)
    - end_date: Data final (padrão: hoje)

    Retorna:
    - Lista com category_id, category_name, total e count para cada categoria
    """
    report_service = ReportService(db)
    breakdown = await report_service.get_category_breakdown(
        user_id=current_user.id,
        transaction_type=type,
        start_date=start_date,
        end_date=end_date
    )
    return breakdown


@router.get("/trends")
async def get_monthly_trends(
    months: int = Query(6, description="Número de meses a considerar", ge=1, le=24),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtém tendências mensais de renda e despesa

    Parâmetros:
    - months: Número de meses anteriores a considerar (padrão: 6, máx: 24)

    Retorna:
    - income: Lista com totais mensais de renda
    - expense: Lista com totais mensais de despesa
    - balance: Lista com saldos mensais
    """
    report_service = ReportService(db)
    trends = await report_service.get_monthly_trends(
        user_id=current_user.id,
        months=months
    )
    return trends


@router.get("/patterns")
async def get_spending_patterns(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtém padrões de gastos dos últimos 30 dias

    Retorna:
    - top_expense_categories: Top 5 categorias com mais gastos
    - average_daily_spending: Gasto médio diário
    - period_days: Número de dias no período (30)
    """
    report_service = ReportService(db)
    patterns = await report_service.get_spending_patterns(current_user.id)
    return patterns
