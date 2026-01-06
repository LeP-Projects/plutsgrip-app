"""
Rate Limiter Configuration
Custom rate limiter that respects IP whitelist
"""
from typing import Optional, Set
from datetime import datetime
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address


# In-memory whitelist cache (synced from database)
_whitelist_cache: Set[str] = set()
_whitelist_last_sync: Optional[datetime] = None
_whitelist_sync_interval = 60  # seconds


def get_whitelist_cache() -> Set[str]:
    """Get the current whitelist cache"""
    return _whitelist_cache


def update_whitelist_cache(ips: Set[str]) -> None:
    """Update the whitelist cache"""
    global _whitelist_cache, _whitelist_last_sync
    _whitelist_cache = ips
    _whitelist_last_sync = datetime.utcnow()


def cache_needs_refresh() -> bool:
    """Check if cache needs to be refreshed"""
    if _whitelist_last_sync is None:
        return True
    elapsed = (datetime.utcnow() - _whitelist_last_sync).total_seconds()
    return elapsed > _whitelist_sync_interval


def get_rate_limit_key(request: Request) -> str:
    """
    Custom key function for rate limiting
    
    Returns a special key for whitelisted IPs that effectively
    exempts them from rate limiting by giving them their own bucket.
    
    For whitelisted IPs, returns "whitelist:{ip}" which won't be rate limited
    because each IP gets its own counter that resets.
    
    For non-whitelisted IPs, returns the normal IP-based key.
    """
    ip = get_remote_address(request)
    
    # Check if IP is in whitelist cache
    if ip in _whitelist_cache:
        # Return a unique key per request to effectively bypass rate limits
        # Using timestamp ensures each request gets a fresh counter
        return f"whitelist_exempt_{ip}_{datetime.utcnow().timestamp()}"
    
    return ip


def is_ip_whitelisted(ip: str) -> bool:
    """Check if an IP is in the whitelist cache"""
    return ip in _whitelist_cache


# Create the limiter with custom key function
limiter = Limiter(key_func=get_rate_limit_key)
