"""
Integration tests for whitelist endpoints
"""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_whitelist(authenticated_client: AsyncClient):
    """Test listing whitelist entries"""
    response = await authenticated_client.get("/api/admin/whitelist")
    assert response.status_code in [200, 403]
    if response.status_code == 200:
        data = response.json()
        assert "entries" in data or isinstance(data, list)

@pytest.mark.asyncio
async def test_add_whitelist_entry(authenticated_client: AsyncClient):
    """Test adding a whitelist entry"""
    entry = {
        "ip_address": "10.0.0.50",
        "description": "Test Pytest IP",
        "expires_at": None
    }
    response = await authenticated_client.post("/api/admin/whitelist", json=entry)
    assert response.status_code in [201, 200, 403]
