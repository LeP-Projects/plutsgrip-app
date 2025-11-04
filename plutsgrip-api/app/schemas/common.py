"""
Common schemas used across the application
"""
from typing import Optional, Any
from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """Standard error response schema"""
    error: str
    message: str
    details: Optional[Any] = None


class SuccessResponse(BaseModel):
    """Standard success response schema"""
    success: bool = True
    message: str
    data: Optional[Any] = None


class PaginationParams(BaseModel):
    """Pagination parameters schema"""
    page: int = 1
    page_size: int = 20

    class Config:
        from_attributes = True
