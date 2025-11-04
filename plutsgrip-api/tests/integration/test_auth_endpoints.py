"""
Integration tests for authentication endpoints
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    """Test user registration endpoint"""
    user_data = {
        "name": "New User",
        "email": "newuser@example.com",
        "password": "SecurePass123!"
    }

    response = await client.post("/api/auth/register", json=user_data)

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["name"] == user_data["name"]
    assert "id" in data


@pytest.mark.asyncio
async def test_login_user(client: AsyncClient, sample_user: dict):
    """Test user login endpoint"""
    login_data = {
        "email": sample_user["email"],
        "password": sample_user["password"]
    }

    response = await client.post("/api/auth/login", json=login_data)

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_get_current_user(authenticated_client: AsyncClient, sample_user: dict):
    """Test getting current user info"""
    response = await authenticated_client.get("/api/auth/me")

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == sample_user["email"]


# TODO: Add more authentication tests
# - Test login with wrong credentials
# - Test accessing protected endpoints without token
# - Test token expiration
# - Test refresh token
