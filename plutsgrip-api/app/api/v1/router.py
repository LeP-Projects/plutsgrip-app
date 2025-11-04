"""
API v1 router - Aggregates all endpoint routers
"""
from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    transactions,
    categories,
    reports,
    budgets,
    goals,
    recurring_transactions
)

# Create main API v1 router
api_router = APIRouter(prefix="/api")

# Include all endpoint routers
api_router.include_router(auth.router)
api_router.include_router(transactions.router)
api_router.include_router(categories.router)
api_router.include_router(reports.router)
api_router.include_router(budgets.router)
api_router.include_router(goals.router)
api_router.include_router(recurring_transactions.router)
