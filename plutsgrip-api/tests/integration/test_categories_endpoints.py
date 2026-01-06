"""
Integration tests for category endpoints
"""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_category(authenticated_client: AsyncClient):
    """Test category creation"""
    category_data = {
        "name": "Test Category",
        "type": "expense",
        "color": "#FF0000",
        "icon": "test-icon"
    }
    
    response = await authenticated_client.post("/api/categories", json=category_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == category_data["name"]
    assert data["type"] == category_data["type"]
    assert "id" in data

@pytest.mark.asyncio
async def test_list_categories(authenticated_client: AsyncClient):
    """Test listing categories"""
    # Create a test category first to ensure list isn't empty (though init-db might populate)
    category_data = {
        "name": "Listable Category",
        "type": "income",
        "color": "#00FF00",
        "icon": "list-icon"
    }
    await authenticated_client.post("/api/categories", json=category_data)

    response = await authenticated_client.get("/api/categories")
    
    assert response.status_code == 200
    data = response.json()
    assert "categories" in data
    assert "total" in data
    assert len(data["categories"]) > 0

@pytest.mark.asyncio
async def test_filter_categories_by_type(authenticated_client: AsyncClient):
    """Test filtering categories by type"""
    # Create explicit types
    await authenticated_client.post("/api/categories", json={"name": "Exp", "type": "expense", "color": "#111111", "icon": "e"})
    await authenticated_client.post("/api/categories", json={"name": "Inc", "type": "income", "color": "#222222", "icon": "i"})

    response = await authenticated_client.get("/api/categories?type=expense")
    assert response.status_code == 200
    data = response.json()
    for cat in data["categories"]:
        assert cat["type"] == "expense"

@pytest.mark.asyncio
async def test_update_category(authenticated_client: AsyncClient):
    """Test updating a category"""
    # Create
    create_res = await authenticated_client.post("/api/categories", json={
        "name": "Old Name", "type": "expense", "color": "#333333", "icon": "old"
    })
    cat_id = create_res.json()["id"]

    # Update
    update_data = {
        "name": "New Name",
        "color": "#444444"
    }
    response = await authenticated_client.put(f"/api/categories/{cat_id}", json=update_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "New Name"
    # Verify type didn't change if not provided (depending on schema) or persist
    assert data["id"] == cat_id

@pytest.mark.asyncio
async def test_delete_category(authenticated_client: AsyncClient):
    """Test deleting a category"""
    # Create
    create_res = await authenticated_client.post("/api/categories", json={
        "name": "Cat To Del", "type": "expense", "color": "#FF0000", "icon": "test-icon"
    })
    cat_id = create_res.json()["id"]

    # Delete
    response = await authenticated_client.delete(f"/api/categories/{cat_id}")
    assert response.status_code == 204

    # Verify gone
    get_res = await authenticated_client.get(f"/api/categories/{cat_id}")
    assert get_res.status_code == 404
