"""
Schemas de Metas Financeiras para validação de requisições/respostas
"""
from datetime import datetime, date as DateType
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, computed_field


# Schemas de Requisição
class GoalCreateRequest(BaseModel):
    """Schema para criar meta"""
    name: str = Field(..., min_length=1, max_length=255, description="Nome da meta")
    description: Optional[str] = Field(None, description="Descrição da meta")
    target_amount: Decimal = Field(..., gt=0, decimal_places=2, description="Valor alvo")
    deadline: Optional[DateType] = Field(None, description="Data limite")
    category: Optional[str] = Field(None, max_length=100, description="Categoria (ex: poupança, viagem)")
    priority: str = Field("medium", description="Prioridade (low, medium, high)")


class GoalUpdateRequest(BaseModel):
    """Schema para atualizar meta"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    target_amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    current_amount: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    deadline: Optional[DateType] = None
    category: Optional[str] = Field(None, max_length=100)
    priority: Optional[str] = None
    is_completed: Optional[bool] = None


# Schemas de Resposta
class GoalResponse(BaseModel):
    """Schema para resposta de meta"""
    id: int
    user_id: int
    name: str
    description: Optional[str]
    target_amount: Decimal
    current_amount: Decimal
    deadline: Optional[DateType]
    category: Optional[str]
    priority: str
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

    @computed_field
    @property
    def progress_percentage(self) -> float:
        """Calcula porcentagem de progresso"""
        if self.target_amount == 0:
            return 0.0
        return min(float(self.current_amount / self.target_amount * 100), 100.0)
