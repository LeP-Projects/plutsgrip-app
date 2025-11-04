"""
Transaction endpoints
GET /api/transactions - List all transactions with filters
GET /api/transactions/:id - Get specific transaction
POST /api/transactions - Create new transaction
PUT /api/transactions/:id - Update transaction
DELETE /api/transactions/:id - Delete transaction
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.transaction import (
    TransactionCreateRequest,
    TransactionUpdateRequest,
    TransactionResponse,
    TransactionListResponse
)
from app.services.transaction_service import TransactionService

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("", response_model=TransactionListResponse)
async def list_transactions(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    type: Optional[str] = Query(None, description="Filter by type (income/expense)"),
    category: Optional[int] = Query(None, description="Filter by category ID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all transactions for current user with optional filters

    TODO: Implement filtering and pagination
    - Apply filters (type, category)
    - Implement pagination
    - Return transactions with total count
    """
    transaction_service = TransactionService(db)

    skip = (page - 1) * page_size
    transactions = await transaction_service.get_user_transactions(
        user_id=current_user.id,
        skip=skip,
        limit=page_size,
        transaction_type=type,
        category_id=category
    )

    # TODO: Get total count for pagination
    total = len(transactions)

    return TransactionListResponse(
        transactions=[TransactionResponse.model_validate(t) for t in transactions],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific transaction by ID

    Verifies that the transaction belongs to the authenticated user
    """
    transaction_service = TransactionService(db)

    transaction = await transaction_service.get_transaction_by_id(transaction_id, current_user.id)

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    return TransactionResponse.model_validate(transaction)


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction_data: TransactionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new transaction

    TODO: Implement transaction creation
    - Validate input data
    - Create transaction in database
    - Return created transaction
    """
    transaction_service = TransactionService(db)

    transaction = await transaction_service.create_transaction(
        user_id=current_user.id,
        transaction_data=transaction_data
    )

    return TransactionResponse.model_validate(transaction)


@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int,
    transaction_data: TransactionUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a transaction

    TODO: Implement transaction update
    - Verify transaction belongs to current user
    - Update transaction data
    - Return updated transaction
    """
    transaction_service = TransactionService(db)

    transaction = await transaction_service.update_transaction(
        transaction_id=transaction_id,
        user_id=current_user.id,
        transaction_data=transaction_data
    )

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    return TransactionResponse.model_validate(transaction)


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a transaction

    TODO: Implement transaction deletion
    - Verify transaction belongs to current user
    - Delete transaction from database
    - Return success response
    """
    transaction_service = TransactionService(db)

    deleted = await transaction_service.delete_transaction(
        transaction_id=transaction_id,
        user_id=current_user.id
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    return None
