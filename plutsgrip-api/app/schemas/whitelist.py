"""
Whitelist schemas for request/response validation
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, IPvAnyAddress


class WhitelistCreateRequest(BaseModel):
    """Schema for adding IP to whitelist"""
    ip_address: str = Field(..., description="IP address to whitelist")
    description: Optional[str] = Field(None, description="Reason for whitelisting")
    expires_at: Optional[datetime] = Field(None, description="Optional expiration datetime")


class WhitelistResponse(BaseModel):
    """Schema for whitelist entry response"""
    id: int
    ip_address: str
    description: Optional[str]
    is_active: bool
    created_by: Optional[int]
    expires_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WhitelistListResponse(BaseModel):
    """Schema for whitelist list response"""
    entries: list[WhitelistResponse]
    total: int
