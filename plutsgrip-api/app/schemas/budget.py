"""
Schemas de Orçamento para validação de requisições/respostas
"""
from datetime import datetime, date as DateType
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field


# Schemas de Requisição
class BudgetCreateRequest(BaseModel):
    """Schema para criar orçamento"""
    category_id: int = Field(..., description="ID da categoria")
    amount: Decimal = Field(..., gt=0, decimal_places=2, description="Valor orçado")
    period: str = Field("monthly", description="Período (monthly, quarterly, yearly)")
    start_date: DateType = Field(..., description="Data de início")


class BudgetUpdateRequest(BaseModel):
    """Schema para atualizar orçamento"""
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    period: Optional[str] = None
    start_date: Optional[DateType] = None
    notifications_enabled: Optional[bool] = None


# Schemas de Resposta
class BudgetResponse(BaseModel):
    """Schema para resposta de orçamento"""
    id: int
    user_id: int
    category_id: int
    amount: Decimal
    period: str
    start_date: DateType
    notifications_enabled: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
