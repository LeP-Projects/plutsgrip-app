"""
Rate Limit Whitelist Service
Manages whitelist entries and provides caching for performance
"""
from typing import Optional, List, Set
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.rate_limit_whitelist import RateLimitWhitelist


class WhitelistCache:
    """Simple in-memory cache for whitelisted IPs"""
    _instance = None
    _ips: Set[str] = set()
    _last_refresh: Optional[datetime] = None
    _cache_ttl_seconds: int = 60  # Refresh every 60 seconds
    
    @classmethod
    def get_instance(cls) -> "WhitelistCache":
        if cls._instance is None:
            cls._instance = WhitelistCache()
        return cls._instance
    
    def is_cached(self, ip: str) -> bool:
        return ip in self._ips
    
    def needs_refresh(self) -> bool:
        if self._last_refresh is None:
            return True
        elapsed = (datetime.utcnow() - self._last_refresh).total_seconds()
        return elapsed > self._cache_ttl_seconds
    
    def update(self, ips: Set[str]) -> None:
        self._ips = ips
        self._last_refresh = datetime.utcnow()
    
    def clear(self) -> None:
        self._ips = set()
        self._last_refresh = None


class WhitelistService:
    """Service for managing rate limit whitelist"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.cache = WhitelistCache.get_instance()
    
    async def get_all_whitelisted_ips(self) -> List[RateLimitWhitelist]:
        """Get all whitelist entries"""
        result = await self.db.execute(
            select(RateLimitWhitelist).order_by(RateLimitWhitelist.created_at.desc())
        )
        return list(result.scalars().all())
    
    async def get_active_ips(self) -> Set[str]:
        """Get set of active whitelisted IP addresses"""
        now = datetime.utcnow()
        result = await self.db.execute(
            select(RateLimitWhitelist.ip_address).where(
                RateLimitWhitelist.is_active == True,
                (RateLimitWhitelist.expires_at == None) | (RateLimitWhitelist.expires_at > now)
            )
        )
        return {row[0] for row in result.all()}
    
    async def is_whitelisted(self, ip: str) -> bool:
        """Check if IP is whitelisted (uses cache)"""
        # Check cache first
        if not self.cache.needs_refresh() and self.cache.is_cached(ip):
            return True
        
        # Refresh cache if needed
        if self.cache.needs_refresh():
            active_ips = await self.get_active_ips()
            self.cache.update(active_ips)
        
        return self.cache.is_cached(ip)
    
    async def add_ip(
        self, 
        ip_address: str, 
        description: Optional[str] = None,
        created_by: Optional[int] = None,
        expires_at: Optional[datetime] = None
    ) -> RateLimitWhitelist:
        """Add IP to whitelist"""
        whitelist_entry = RateLimitWhitelist(
            ip_address=ip_address,
            description=description,
            created_by=created_by,
            expires_at=expires_at,
            is_active=True
        )
        self.db.add(whitelist_entry)
        await self.db.commit()
        await self.db.refresh(whitelist_entry)
        
        # Clear cache to force refresh
        self.cache.clear()
        
        return whitelist_entry
    
    async def remove_ip(self, whitelist_id: int) -> bool:
        """Remove IP from whitelist (soft delete by setting is_active=False)"""
        result = await self.db.execute(
            select(RateLimitWhitelist).where(RateLimitWhitelist.id == whitelist_id)
        )
        entry = result.scalars().first()
        
        if not entry:
            return False
        
        entry.is_active = False
        await self.db.commit()
        
        # Clear cache to force refresh
        self.cache.clear()
        
        return True
    
    async def delete_ip(self, whitelist_id: int) -> bool:
        """Permanently delete whitelist entry"""
        result = await self.db.execute(
            select(RateLimitWhitelist).where(RateLimitWhitelist.id == whitelist_id)
        )
        entry = result.scalars().first()
        
        if not entry:
            return False
        
        await self.db.delete(entry)
        await self.db.commit()
        
        # Clear cache to force refresh
        self.cache.clear()
        
        return True
