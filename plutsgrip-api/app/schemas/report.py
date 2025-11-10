"""
Report schemas for dashboard and financial summaries
"""
from datetime import date
from decimal import Decimal
from typing import Optional, Dict
from pydantic import BaseModel, Field, field_serializer


class DashboardResponse(BaseModel):
    """Schema for dashboard summary response"""
    total_income: Decimal
    total_expense: Decimal
    balance: Decimal
    transaction_count: int
    income_count: int
    expense_count: int

    @field_serializer('total_income', 'total_expense', 'balance')
    def serialize_amounts(self, value: Decimal) -> float:
        """Serialize Decimal amounts to float for JSON compatibility"""
        return float(value)


class CategorySummary(BaseModel):
    """Schema for category summary in reports"""
    category_id: Optional[int]
    category_name: Optional[str]
    total: Decimal
    count: int
    percentage: float

    @field_serializer('total')
    def serialize_total(self, value: Decimal) -> float:
        """Serialize Decimal total to float for JSON compatibility"""
        return float(value)


class FinancialSummaryResponse(BaseModel):
    """Schema for detailed financial summary response"""
    period_start: date
    period_end: date
    total_income: Decimal
    total_expense: Decimal
    net_balance: Decimal
    transaction_count: int
    income_by_category: list[CategorySummary]
    expense_by_category: list[CategorySummary]
    daily_totals: Dict[str, Dict[str, Decimal]]  # {date: {income: x, expense: y}}

    @field_serializer('total_income', 'total_expense', 'net_balance')
    def serialize_amounts(self, value: Decimal) -> float:
        """Serialize Decimal amounts to float for JSON compatibility"""
        return float(value)


class ReportFilters(BaseModel):
    """Schema for report filter parameters"""
    start_date: Optional[date] = Field(None, description="Start date for report period")
    end_date: Optional[date] = Field(None, description="End date for report period")
