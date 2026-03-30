"""
Category endpoints.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.category import Category, TransactionType
from app.models.user import User
from app.schemas.category import (
    CategoryCreate,
    CategoryListResponse,
    CategoryResponse,
    CategoryUpdate,
)
from app.services.category_service import CategoryService

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=CategoryListResponse)
async def list_categories(
    type: Optional[TransactionType] = Query(None, description="Filter by type"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Return only the authenticated user's personal categories.
    """
    conditions = [
        Category.user_id == current_user.id,
        Category.is_default.is_(False),
        Category.deleted_at.is_(None),
    ]

    if type:
        conditions.append(Category.type == type)

    result = await db.execute(
        select(Category)
        .where(and_(*conditions))
        .order_by(Category.type, Category.name)
    )
    categories = result.scalars().all()

    return CategoryListResponse(
        categories=[CategoryResponse.model_validate(category) for category in categories],
        total=len(categories),
    )


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Return a specific category by id."""
    category_service = CategoryService(db)
    category = await category_service.get_category_by_id(category_id)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return CategoryResponse.model_validate(category)


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new personal category for the current user."""
    category_service = CategoryService(db)
    category = await category_service.create_category(
        name=category_data.name,
        transaction_type=category_data.type,
        color=category_data.color,
        icon=category_data.icon,
        user_id=current_user.id,
    )
    return CategoryResponse.model_validate(category)


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a personal category owned by the current user."""
    category_service = CategoryService(db)
    category = await category_service.get_category_by_id(category_id)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    if category.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this category",
        )

    update_data = category_data.model_dump(exclude_unset=True)
    updated_category = await category_service.update_category(category_id, **update_data)
    return CategoryResponse.model_validate(updated_category)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a personal category owned by the current user."""
    category_service = CategoryService(db)
    category = await category_service.get_category_by_id(category_id)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    if category.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this category",
        )

    await category_service.delete_category(category_id)
    return None
