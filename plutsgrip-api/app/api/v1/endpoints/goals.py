"""
Endpoints de Metas Financeiras

GET /api/goals - Listar metas
POST /api/goals - Criar meta
GET /api/goals/:id - Obter meta específica
PUT /api/goals/:id - Atualizar meta
DELETE /api/goals/:id - Deletar meta
POST /api/goals/:id/progress - Adicionar progresso
POST /api/goals/:id/complete - Marcar como concluída
GET /api/goals/summary - Resumo de progresso
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.goal import GoalCreateRequest, GoalUpdateRequest, GoalResponse
from app.services.goal_service import GoalService

router = APIRouter(prefix="/goals", tags=["Metas"])


class AddProgressRequest(BaseModel):
    """Requisição para adicionar progresso"""
    amount: Decimal = Field(..., gt=0, decimal_places=2, description="Valor a adicionar")


@router.get("", response_model=list[GoalResponse])
async def list_goals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_completed: Optional[bool] = Query(None, description="Filtrar por status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Lista metas do usuário

    Parâmetros:
    - skip: Número de registros a pular (padrão: 0)
    - limit: Limite de registros (padrão: 100, máx: 1000)
    - is_completed: Filtrar por concluídas/pendentes (opcional)
    """
    service = GoalService(db)
    goals = await service.get_user_goals(current_user.id, skip, limit, is_completed)
    return goals


@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal_data: GoalCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Cria uma nova meta

    Body:
    - name: Nome da meta
    - description: Descrição (opcional)
    - target_amount: Valor alvo
    - deadline: Data limite (opcional)
    - category: Categoria (opcional)
    - priority: Prioridade (low, medium, high)
    """
    service = GoalService(db)
    goal = await service.create_goal(
        user_id=current_user.id,
        name=goal_data.name,
        target_amount=goal_data.target_amount,
        description=goal_data.description,
        deadline=goal_data.deadline,
        category=goal_data.category,
        priority=goal_data.priority
    )
    return goal


@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Obtém uma meta específica"""
    service = GoalService(db)
    goal = await service.get_goal(goal_id, current_user.id)
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meta não encontrada"
        )
    return goal


@router.put("/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: int,
    goal_data: GoalUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Atualiza uma meta"""
    service = GoalService(db)
    update_data = goal_data.dict(exclude_unset=True)
    goal = await service.update_goal(goal_id, current_user.id, **update_data)
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meta não encontrada"
        )
    return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Deleta uma meta"""
    service = GoalService(db)
    success = await service.delete_goal(goal_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meta não encontrada"
        )


@router.post("/{goal_id}/progress", response_model=GoalResponse)
async def add_progress(
    goal_id: int,
    progress_data: AddProgressRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Adiciona progresso a uma meta

    Body:
    - amount: Valor a adicionar
    """
    service = GoalService(db)
    goal = await service.add_progress(goal_id, current_user.id, progress_data.amount)
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meta não encontrada"
        )
    return goal


@router.post("/{goal_id}/complete", response_model=GoalResponse)
async def complete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Marca uma meta como concluída"""
    service = GoalService(db)
    goal = await service.mark_as_completed(goal_id, current_user.id)
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meta não encontrada"
        )
    return goal


@router.get("/summary/progress")
async def get_goals_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtém resumo de progresso das metas

    Retorna:
    - total_goals: Total de metas
    - completed_goals: Metas concluídas
    - pending_goals: Metas pendentes
    - completion_percentage: Percentual de conclusão
    """
    service = GoalService(db)
    summary = await service.get_goal_progress_summary(current_user.id)
    return summary
