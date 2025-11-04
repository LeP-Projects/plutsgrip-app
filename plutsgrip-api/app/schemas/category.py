"""
Category schemas for request/response validation
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.category import TransactionType


# Response Schemas
class CategoryResponse(BaseModel):
    """Schema for category response"""
    id: int
    name: str
    type: TransactionType
    color: Optional[str] = None
    icon: Optional[str] = None
    is_default: bool
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CategoryListResponse(BaseModel):
    """Schema for category list response"""
    categories: list[CategoryResponse]
    total: int
