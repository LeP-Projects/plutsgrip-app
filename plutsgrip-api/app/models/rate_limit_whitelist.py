"""
Rate Limit Whitelist Model
Stores IPs that can bypass rate limiting
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import BaseModel


class RateLimitWhitelist(Base, BaseModel):
    """
    Model for storing whitelisted IPs that bypass rate limiting
    
    Attributes:
        ip_address: IP address or CIDR range to whitelist
        description: Reason for whitelisting this IP
        is_active: Whether this whitelist entry is currently active
        created_by: User ID who created this entry (optional)
        expires_at: Optional expiration datetime for temporary whitelisting
    """
    __tablename__ = "rate_limit_whitelists"
    
    ip_address = Column(String(45), unique=True, nullable=False, index=True)  # IPv6 max length
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    expires_at = Column(DateTime, nullable=True)
    
    # Relationship
    creator = relationship("User", backref="whitelist_entries")
    
    def is_valid(self) -> bool:
        """Check if this whitelist entry is currently valid"""
        if not self.is_active:
            return False
        if self.expires_at and self.expires_at < datetime.utcnow():
            return False
        return True
    
    def __repr__(self):
        return f"<RateLimitWhitelist(ip={self.ip_address}, active={self.is_active})>"
