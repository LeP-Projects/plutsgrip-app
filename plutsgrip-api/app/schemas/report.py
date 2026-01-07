"""
Report schemas for dashboard and financial summaries
"""
from datetime import date
from decimal import Decimal
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, field_serializer


class DashboardResponse(BaseModel):
    """Schema for dashboard summary response"""
    total_income: float
    total_expense: float
    balance: float
    transaction_count: int
    income_count: int
    expense_count: int


class CategorySummary(BaseModel):
    """Schema for category summary in reports"""
    category_id: Optional[int]
    category_name: Optional[str]
    total: float
    count: int


class FinancialSummaryResponse(BaseModel):
    """Schema for detailed financial summary response"""
    period_start: str  # Accept isoformat string from service
    period_end: str  # Accept isoformat string from service
    total_income: float
    total_expense: float
    net_balance: float
    transaction_count: int
    income_by_category: List[Dict[str, Any]]  # Accept raw dict from service
    expense_by_category: List[Dict[str, Any]]  # Accept raw dict from service
    daily_totals: Dict[str, float]  # {date: total}


class ReportFilters(BaseModel):
    """Schema for report filter parameters"""
    start_date: Optional[date] = Field(None, description="Start date for report period")
    end_date: Optional[date] = Field(None, description="End date for report period")
