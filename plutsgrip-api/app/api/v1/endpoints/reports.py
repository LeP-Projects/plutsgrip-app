"""
Report endpoints.
"""
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.category import TransactionType
from app.models.user import User
from app.schemas.report import DashboardResponse, FinancialSummaryResponse
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return dashboard summary statistics."""
    report_service = ReportService(db)
    dashboard_data = await report_service.get_dashboard_summary(current_user.id)
    return DashboardResponse(**dashboard_data)


@router.get("/summary", response_model=FinancialSummaryResponse)
async def get_financial_summary(
    start_date: Optional[date] = Query(None, description="Report start date"),
    end_date: Optional[date] = Query(None, description="Report end date"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return detailed financial summary for a date range."""
    report_service = ReportService(db)
    summary_data = await report_service.get_financial_summary(
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
    )
    return FinancialSummaryResponse(**summary_data)


@router.get("/categories")
async def get_category_breakdown(
    type: str = Query(..., description="Transaction type: INCOME or EXPENSE"),
    start_date: Optional[date] = Query(None, description="Report start date"),
    end_date: Optional[date] = Query(None, description="Report end date"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return totals grouped by category for the requested transaction type."""
    try:
        transaction_type = TransactionType(type.upper())
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail="Transaction type must be INCOME or EXPENSE",
        ) from exc

    report_service = ReportService(db)
    breakdown = await report_service.get_category_breakdown(
        user_id=current_user.id,
        transaction_type=transaction_type,
        start_date=start_date,
        end_date=end_date,
    )
    return breakdown


@router.get("/trends")
async def get_monthly_trends(
    months: int = Query(6, description="Number of months to include", ge=1, le=24),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return monthly income, expense, and balance trends."""
    report_service = ReportService(db)
    trends = await report_service.get_monthly_trends(
        user_id=current_user.id,
        months=months,
    )
    return trends


@router.get("/patterns")
async def get_spending_patterns(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return spending patterns for the current user."""
    report_service = ReportService(db)
    patterns = await report_service.get_spending_patterns(current_user.id)
    return patterns
