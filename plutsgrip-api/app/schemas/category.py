"""
Category schemas for request/response validation
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.models.category import TransactionType


# Request Schemas
class CategoryCreate(BaseModel):
    """Schema for creating a new category"""
    name: str = Field(..., min_length=1, max_length=100)
    type: TransactionType
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = Field(None, max_length=50)

    @field_validator('type', mode='before')
    @classmethod
    def normalize_type(cls, v):
        """Convert type to uppercase to accept both 'income' and 'INCOME'"""
        if isinstance(v, str):
            return v.upper()
        return v

    model_config = ConfigDict(from_attributes=True)


class CategoryUpdate(BaseModel):
    """Schema for updating a category"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    type: Optional[TransactionType] = None
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = Field(None, max_length=50)

    @field_validator('type', mode='before')
    @classmethod
    def normalize_type(cls, v):
        """Convert type to uppercase to accept both 'income' and 'INCOME'"""
        if isinstance(v, str):
            return v.upper()
        return v

    model_config = ConfigDict(from_attributes=True)


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

    model_config = ConfigDict(from_attributes=True)


class CategoryListResponse(BaseModel):
    """Schema for category list response"""
    categories: list[CategoryResponse]
    total: int
