"""
Endpoints de Orçamento

GET /api/budgets - Listar orçamentos
POST /api/budgets - Criar novo orçamento
GET /api/budgets/:id - Obter orçamento específico
PUT /api/budgets/:id - Atualizar orçamento
DELETE /api/budgets/:id - Deletar orçamento
GET /api/budgets/:id/status - Obter status do orçamento
"""
from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.budget import BudgetCreateRequest, BudgetUpdateRequest, BudgetResponse
from app.services.budget_service import BudgetService

router = APIRouter(prefix="/budgets", tags=["Orçamentos"])


@router.get("", response_model=list[BudgetResponse])
async def list_budgets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Lista orçamentos do usuário autenticado

    Parâmetros:
    - skip: Número de registros a pular (padrão: 0)
    - limit: Limite de registros (padrão: 100, máx: 1000)
    """
    service = BudgetService(db)
    budgets = await service.get_user_budgets(current_user.id, skip, limit)
    return budgets


@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_budget(
    budget_data: BudgetCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Cria um novo orçamento

    Body:
    - category_id: ID da categoria
    - amount: Valor orçado
    - period: Período (monthly, quarterly, yearly)
    - start_date: Data de início
    """
    service = BudgetService(db)
    budget = await service.create_budget(
        user_id=current_user.id,
        category_id=budget_data.category_id,
        amount=budget_data.amount,
        period=budget_data.period,
        start_date=budget_data.start_date
    )
    return budget


@router.get("/{budget_id}", response_model=BudgetResponse)
async def get_budget(
    budget_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Obtém um orçamento específico"""
    service = BudgetService(db)
    budget = await service.get_budget(budget_id, current_user.id)
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orçamento não encontrado"
        )
    return budget


@router.put("/{budget_id}", response_model=BudgetResponse)
async def update_budget(
    budget_id: int,
    budget_data: BudgetUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Atualiza um orçamento"""
    service = BudgetService(db)
    update_data = budget_data.dict(exclude_unset=True)
    budget = await service.update_budget(budget_id, current_user.id, **update_data)
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orçamento não encontrado"
        )
    return budget


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(
    budget_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Deleta um orçamento"""
    service = BudgetService(db)
    success = await service.delete_budget(budget_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orçamento não encontrado"
        )


@router.get("/{budget_id}/status")
async def get_budget_status(
    budget_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtém status do orçamento (gasto atual vs limite)

    Retorna:
    - budget_amount: Valor orçado
    - spent_amount: Valor gasto
    - remaining_amount: Valor restante
    - percentage_used: Percentual utilizado
    - is_exceeded: Se excedeu o orçamento
    """
    service = BudgetService(db)
    status_data = await service.get_budget_status(budget_id, current_user.id)
    if not status_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orçamento não encontrado"
        )
    return status_data
