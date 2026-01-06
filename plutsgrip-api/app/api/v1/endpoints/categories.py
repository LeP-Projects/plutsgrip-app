"""
Category endpoints
GET /api/categories - List all categories with optional type filter
GET /api/categories/:id - Get specific category
POST /api/categories - Create new category
PUT /api/categories/:id - Update category
DELETE /api/categories/:id - Delete category
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.category import CategoryResponse, CategoryListResponse, CategoryCreate, CategoryUpdate
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


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new category for the current user

    Requires authentication
    """
    category_service = CategoryService(db)

    category = await category_service.create_category(
        name=category_data.name,
        transaction_type=category_data.type,
        color=category_data.color,
        icon=category_data.icon,
        user_id=current_user.id
    )

    return CategoryResponse.model_validate(category)


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a category

    Requires authentication. User can only update their own categories.
    """
    category_service = CategoryService(db)

    # Verify category exists and belongs to user
    category = await category_service.get_category_by_id(category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    if category.user_id is not None and category.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this category"
        )

    update_data = category_data.model_dump(exclude_unset=True)

    updated_category = await category_service.update_category(category_id, **update_data)

    return CategoryResponse.model_validate(updated_category)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a category (soft delete)

    Requires authentication. User can only delete their own categories.
    """
    category_service = CategoryService(db)

    # Verify category exists and belongs to user
    category = await category_service.get_category_by_id(category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    if category.user_id is not None and category.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this category"
        )

    await category_service.delete_category(category_id)

    return None
