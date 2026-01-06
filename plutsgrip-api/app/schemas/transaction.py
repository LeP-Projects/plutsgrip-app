"""
Transaction schemas for request/response validation
"""
from datetime import datetime
from datetime import date as DateType
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, field_serializer
from app.models.category import TransactionType
from app.schemas.category import CategoryResponse


# Request Schemas
class TransactionCreateRequest(BaseModel):
    """Schema for transaction creation request"""
    description: str = Field(..., min_length=1, max_length=255, description="Transaction description")
    amount: Decimal = Field(..., gt=0, decimal_places=2, description="Transaction amount")
    currency: Optional[str] = Field(None, min_length=3, max_length=3, description="Currency code (e.g., BRL, USD)")
    date: DateType = Field(..., description="Transaction date")
    type: TransactionType = Field(..., description="Transaction type (income or expense)")
    category_id: Optional[int] = Field(None, description="Category ID")
    notes: Optional[str] = Field(None, description="Optional notes")
    tags: Optional[str] = Field(None, max_length=255, description="Comma-separated tags")
    is_recurring: bool = Field(False, description="Flag indicating if transaction is recurring")
    recurring_transaction_id: Optional[int] = Field(None, description="ID of recurring transaction template")


class TransactionUpdateRequest(BaseModel):
    """Schema for transaction update request"""
    description: Optional[str] = Field(None, min_length=1, max_length=255)
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    date: Optional[DateType] = None
    type: Optional[TransactionType] = None
    category_id: Optional[int] = None
    notes: Optional[str] = None
    tags: Optional[str] = Field(None, max_length=255)
    is_recurring: Optional[bool] = None
    recurring_transaction_id: Optional[int] = None


# Response Schemas
class TransactionResponse(BaseModel):
    """Schema for transaction response"""
    id: int
    user_id: int
    description: str
    amount: Decimal
    currency: Optional[str]
    date: DateType
    type: TransactionType
    category_id: Optional[int]
    notes: Optional[str]
    tags: Optional[str]
    is_recurring: bool
    recurring_transaction_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None

    model_config = ConfigDict(from_attributes=True)

    @field_serializer('amount')
    def serialize_amount(self, value: Decimal) -> float:
        """Serialize Decimal amount to float for JSON compatibility"""
        return float(value)


class TransactionListResponse(BaseModel):
    """Schema for transaction list response"""
    transactions: list[TransactionResponse]
    total: int
    page: int = 1
    page_size: int = 20
