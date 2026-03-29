"""
Integration tests for report endpoints
"""
from datetime import date
from decimal import Decimal

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category, TransactionType
from app.models.transaction import Transaction


async def seed_report_data(test_db: AsyncSession, user_id: int) -> None:
    food_category = Category(
        name="Alimentacao",
        type=TransactionType.EXPENSE,
        color="#22C55E",
        icon="utensils",
        is_default=False,
        user_id=user_id,
    )
    salary_category = Category(
        name="Salario",
        type=TransactionType.INCOME,
        color="#2563EB",
        icon="wallet",
        is_default=False,
        user_id=user_id,
    )

    test_db.add_all([food_category, salary_category])
    await test_db.flush()

    transactions = [
        Transaction(
            user_id=user_id,
            description="Salario mensal",
            amount=Decimal("5000.00"),
            date=date(2026, 3, 1),
            type=TransactionType.INCOME,
            category_id=salary_category.id,
            notes="Credito em conta",
        ),
        Transaction(
            user_id=user_id,
            description="Supermercado",
            amount=Decimal("250.00"),
            date=date(2026, 3, 5),
            type=TransactionType.EXPENSE,
            category_id=food_category.id,
            notes="Compras do mes",
        ),
        Transaction(
            user_id=user_id,
            description="Padaria",
            amount=Decimal("50.00"),
            date=date(2026, 3, 5),
            type=TransactionType.EXPENSE,
            category_id=food_category.id,
            notes="Cafe da manha",
        ),
    ]

    test_db.add_all(transactions)
    await test_db.commit()


@pytest.mark.asyncio
async def test_get_dashboard_stats_returns_financial_totals(
    authenticated_client: AsyncClient,
    test_db: AsyncSession,
    sample_user: dict,
):
    await seed_report_data(test_db, sample_user["id"])

    response = await authenticated_client.get("/api/reports/dashboard")

    assert response.status_code == 200
    data = response.json()

    assert data["total_income"] == 5000.0
    assert data["total_expense"] == 300.0
    assert data["balance"] == 4700.0
    assert data["transaction_count"] == 3
    assert data["income_count"] == 1
    assert data["expense_count"] == 2


@pytest.mark.asyncio
async def test_get_financial_summary_returns_nested_daily_totals(
    authenticated_client: AsyncClient,
    test_db: AsyncSession,
    sample_user: dict,
):
    await seed_report_data(test_db, sample_user["id"])

    response = await authenticated_client.get(
        "/api/reports/summary?start_date=2026-03-01&end_date=2026-03-31"
    )

    assert response.status_code == 200
    data = response.json()

    assert data["period_start"] == "2026-03-01"
    assert data["period_end"] == "2026-03-31"
    assert data["total_income"] == 5000.0
    assert data["total_expense"] == 300.0
    assert data["net_balance"] == 4700.0
    assert data["transaction_count"] == 3

    assert len(data["income_by_category"]) == 1
    assert data["income_by_category"][0]["category_name"] == "Salario"
    assert data["income_by_category"][0]["total"] == 5000.0
    assert data["income_by_category"][0]["count"] == 1
    assert data["income_by_category"][0]["percentage"] == 100.0

    assert len(data["expense_by_category"]) == 1
    assert data["expense_by_category"][0]["category_name"] == "Alimentacao"
    assert data["expense_by_category"][0]["total"] == 300.0
    assert data["expense_by_category"][0]["count"] == 2
    assert data["expense_by_category"][0]["percentage"] == 100.0

    assert data["daily_totals"] == {
        "2026-03-01": {
            "income": 5000.0,
            "expense": 0.0,
        },
        "2026-03-05": {
            "income": 0.0,
            "expense": 300.0,
        },
    }
