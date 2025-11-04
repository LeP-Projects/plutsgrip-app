"""
Endpoints de Transações Recorrentes

GET /api/recurring-transactions - Listar transações recorrentes
POST /api/recurring-transactions - Criar transação recorrente
GET /api/recurring-transactions/:id - Obter transação recorrente
PUT /api/recurring-transactions/:id - Atualizar transação recorrente
DELETE /api/recurring-transactions/:id - Deletar transação recorrente
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.recurring_transaction import (
    RecurringTransactionCreateRequest,
    RecurringTransactionUpdateRequest,
    RecurringTransactionResponse
)
from app.services.recurring_transaction_service import RecurringTransactionService

router = APIRouter(prefix="/recurring-transactions", tags=["Transações Recorrentes"])


@router.get("", response_model=list[RecurringTransactionResponse])
async def list_recurring_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_active: Optional[bool] = Query(None, description="Filtrar por status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Lista transações recorrentes do usuário

    Parâmetros:
    - skip: Número de registros a pular (padrão: 0)
    - limit: Limite de registros (padrão: 100, máx: 1000)
    - is_active: Filtrar por ativas/inativas (opcional)
    """
    service = RecurringTransactionService(db)
    transactions = await service.get_user_recurring_transactions(
        current_user.id, skip, limit, is_active
    )
    return transactions


@router.post("", response_model=RecurringTransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_recurring_transaction(
    trans_data: RecurringTransactionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Cria uma nova transação recorrente

    Body:
    - description: Descrição
    - amount: Valor
    - currency: Código de moeda (opcional)
    - type: Tipo (income ou expense)
    - category_id: ID da categoria (opcional)
    - frequency: Frequência (daily, weekly, biweekly, monthly, quarterly, yearly)
    - start_date: Data de início
    - end_date: Data de término (opcional)
    - notes: Notas (opcional)
    """
    service = RecurringTransactionService(db)
    transaction = await service.create_recurring_transaction(
        user_id=current_user.id,
        description=trans_data.description,
        amount=trans_data.amount,
        currency=trans_data.currency,
        type=trans_data.type,
        category_id=trans_data.category_id,
        frequency=trans_data.frequency,
        start_date=trans_data.start_date,
        end_date=trans_data.end_date,
        notes=trans_data.notes
    )
    return transaction


@router.get("/{recurring_id}", response_model=RecurringTransactionResponse)
async def get_recurring_transaction(
    recurring_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Obtém uma transação recorrente específica"""
    service = RecurringTransactionService(db)
    transaction = await service.get_recurring_transaction(recurring_id, current_user.id)
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transação recorrente não encontrada"
        )
    return transaction


@router.put("/{recurring_id}", response_model=RecurringTransactionResponse)
async def update_recurring_transaction(
    recurring_id: int,
    trans_data: RecurringTransactionUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Atualiza uma transação recorrente"""
    service = RecurringTransactionService(db)
    update_data = trans_data.dict(exclude_unset=True)
    transaction = await service.update_recurring_transaction(
        recurring_id, current_user.id, **update_data
    )
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transação recorrente não encontrada"
        )
    return transaction


@router.delete("/{recurring_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recurring_transaction(
    recurring_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Deleta uma transação recorrente"""
    service = RecurringTransactionService(db)
    success = await service.delete_recurring_transaction(recurring_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transação recorrente não encontrada"
        )
