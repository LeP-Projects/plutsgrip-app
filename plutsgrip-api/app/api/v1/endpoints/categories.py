"""
Category endpoints
GET /api/categories - List all categories with optional type filter
GET /api/categories/:id - Get specific category
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.category import CategoryResponse, CategoryListResponse
from app.services.category_service import CategoryService
from app.models.category import TransactionType

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=CategoryListResponse)
async def list_categories(
    type: Optional[TransactionType] = Query(None, description="Filter by type (income/expense)"),
    db: AsyncSession = Depends(get_db)
):
    """
    List all categories, optionally filtered by type

    NOTE: This endpoint is public (no authentication required)

    TODO: Implement category listing
    - Get all categories or filter by type
    - Return categories with total count
    """
    category_service = CategoryService(db)

    categories = await category_service.get_all_categories(transaction_type=type)

    return CategoryListResponse(
        categories=[CategoryResponse.model_validate(c) for c in categories],
        total=len(categories)
    )


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific category by ID

    NOTE: This endpoint is public (no authentication required)

    TODO: Implement category retrieval
    - Get category from database
    - Return category data or 404 if not found
    """
    category_service = CategoryService(db)

    category = await category_service.get_category_by_id(category_id)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    return CategoryResponse.model_validate(category)
