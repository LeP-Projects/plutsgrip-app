"""
Schemas de Transações Recorrentes para validação de requisições/respostas
"""
from datetime import datetime, date as DateType
from decimal import Decimal
from typing import Optional, Any
from pydantic import BaseModel, Field, ConfigDict, field_serializer, field_validator
from app.models.category import TransactionType


# Schemas de Requisição
class RecurringTransactionCreateRequest(BaseModel):
    """Schema para criar transação recorrente"""
    description: str = Field(..., min_length=1, max_length=255, description="Descrição")
    amount: Decimal = Field(..., gt=0, decimal_places=2, description="Valor")
    currency: Optional[str] = Field(None, min_length=3, max_length=3, description="Código de moeda")
    type: TransactionType = Field(..., description="Tipo (income ou expense)")
    category_id: Optional[int] = Field(None, description="ID da categoria")
    frequency: str = Field(..., description="Frequência (daily, weekly, biweekly, monthly, quarterly, yearly)")
    start_date: DateType = Field(..., description="Data de início")
    end_date: Optional[DateType] = Field(None, description="Data de término (opcional)")
    notes: Optional[str] = Field(None, description="Notas adicionais")

    @field_validator('type', mode='before')
    @classmethod
    def normalize_type(cls, v):
        """Convert type to uppercase to accept both 'income' and 'INCOME'"""
        if isinstance(v, str):
            return v.upper()
        return v


class RecurringTransactionUpdateRequest(BaseModel):
    """Schema para atualizar transação recorrente"""
    description: Optional[str] = Field(None, min_length=1, max_length=255)
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    type: Optional[TransactionType] = None
    category_id: Optional[int] = None
    frequency: Optional[str] = None
    start_date: Optional[DateType] = None
    end_date: Optional[DateType] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None

    @field_validator('type', mode='before')
    @classmethod
    def normalize_type(cls, v):
        """Convert type to uppercase to accept both 'income' and 'INCOME'"""
        if isinstance(v, str):
            return v.upper()
        return v


# Schemas de Resposta
class RecurringTransactionResponse(BaseModel):
    """Schema para resposta de transação recorrente"""
    id: int
    user_id: int
    description: str
    amount: Decimal
    currency: Optional[str]
    type: Any  # Accept enum or string
    category_id: Optional[int]
    frequency: Any  # Accept enum or string
    start_date: DateType
    end_date: Optional[DateType]
    next_execution_date: DateType
    is_active: bool
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_serializer('amount')
    def serialize_amount(self, value: Decimal) -> float:
        """Serialize Decimal amount to float for JSON compatibility"""
        return float(value)

    @field_serializer('type', 'frequency')
    def serialize_enums(self, value: Any) -> str:
        """Serialize enum to string for JSON compatibility"""
        if hasattr(value, 'value'):
            return value.value
        return str(value)
