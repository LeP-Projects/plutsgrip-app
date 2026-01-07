"""
Admin endpoints for managing rate limit whitelist

GET /api/admin/whitelist - List all whitelisted IPs
POST /api/admin/whitelist - Add IP to whitelist
DELETE /api/admin/whitelist/:id - Remove IP from whitelist
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.whitelist import (
    WhitelistCreateRequest,
    WhitelistResponse,
    WhitelistListResponse
)
from app.services.whitelist_service import WhitelistService

router = APIRouter(prefix="/admin/whitelist", tags=["Admin - Whitelist"])


@router.get("", response_model=WhitelistListResponse)
async def list_whitelist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all whitelisted IPs
    
    Requires authentication.
    TODO: Add admin role check in future.
    """
    service = WhitelistService(db)
    entries = await service.get_all_whitelisted_ips()
    
    return WhitelistListResponse(
        entries=[WhitelistResponse.model_validate(e) for e in entries],
        total=len(entries)
    )


@router.post("", response_model=WhitelistResponse, status_code=status.HTTP_201_CREATED)
async def add_to_whitelist(
    whitelist_data: WhitelistCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Add an IP address to the whitelist
    
    Whitelisted IPs will bypass rate limiting.
    Requires authentication.
    """
    service = WhitelistService(db)
    
    try:
        entry = await service.add_ip(
            ip_address=whitelist_data.ip_address,
            description=whitelist_data.description,
            created_by=current_user.id,
            expires_at=whitelist_data.expires_at
        )
        return WhitelistResponse.model_validate(entry)
    except Exception as e:
        if "unique" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="IP address already whitelisted"
            )
        raise


@router.delete("/{whitelist_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_whitelist(
    whitelist_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Remove an IP from the whitelist
    
    Requires authentication.
    """
    service = WhitelistService(db)
    success = await service.delete_ip(whitelist_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Whitelist entry not found"
        )
    
    return None


@router.get("/check/{ip_address}")
async def check_ip(
    ip_address: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Check if an IP is whitelisted
    
    Public endpoint for debugging.
    """
    service = WhitelistService(db)
    is_whitelisted = await service.is_whitelisted(ip_address)
    
    return {
        "ip_address": ip_address,
        "is_whitelisted": is_whitelisted
    }
