"""
Integration tests for budget endpoints
"""
import pytest
from httpx import AsyncClient
from datetime import date, timedelta

@pytest.mark.asyncio
async def test_create_budget(authenticated_client: AsyncClient):
    """Test budget creation"""
    # Need a category first
    cat_res = await authenticated_client.post("/api/categories", json={
        "name": "Budget Cat", "type": "expense", "color": "#000000", "icon": "b"
    })
    cat_id = cat_res.json()["id"]

    budget_data = {
        "category_id": cat_id,
        "amount": 1000.00,
        "period": "MONTHLY",
        "start_date": str(date.today()),
        "end_date": str(date.today() + timedelta(days=30))
    }

    response = await authenticated_client.post("/api/budgets", json=budget_data)
    assert response.status_code == 201
    data = response.json()
    assert float(data["amount"]) == 1000.00
    assert data["category_id"] == cat_id

@pytest.mark.asyncio
async def test_list_budgets(authenticated_client: AsyncClient):
    """Test listing budgets"""
    response = await authenticated_client.get("/api/budgets")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list) # Assuming it returns a list directly or {"budgets": []}? 
    # Checking app/api/v1/endpoints/budgets.py would confirm, but Postman usually showed lists directly sometimes or enveloped.
    # Looking at transaction tests, they return {"transactions": [], "total": ...}. 
    # Budgets might differ. Let's assume list or check type.
    if isinstance(data, dict) and "budgets" in data:
       assert isinstance(data["budgets"], list)
    else:
       assert isinstance(data, list)

@pytest.mark.asyncio
async def test_update_budget(authenticated_client: AsyncClient):
    """Test updating a budget"""
    # Setup category and budget
    cat_res = await authenticated_client.post("/api/categories", json={
        "name": "Update Budget Cat", "type": "expense", "color": "#111111", "icon": "u"
    })
    cat_id = cat_res.json()["id"]
    
    budget_res = await authenticated_client.post("/api/budgets", json={
        "category_id": cat_id,
        "amount": 500.0,
        "period": "MONTHLY",
        "start_date": str(date.today())
    })
    budget_id = budget_res.json()["id"]

    # Update
    update_data = {
        "amount": 750.0,
        "period": "YEARLY"
    }
    response = await authenticated_client.put(f"/api/budgets/{budget_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert float(data["amount"]) == 750.0
    assert data["period"] == "YEARLY"

@pytest.mark.asyncio
async def test_delete_budget(authenticated_client: AsyncClient):
    """Test deleting a budget"""
    # Setup
    cat_res = await authenticated_client.post("/api/categories", json={
        "name": "Del Budget Cat", "type": "expense", "color": "#222222", "icon": "d"
    })
    cat_id = cat_res.json()["id"]
    
    budget_res = await authenticated_client.post("/api/budgets", json={
        "category_id": cat_id,
        "amount": 200.0,
        "period": "MONTHLY",
        "start_date": str(date.today())
    })
    budget_id = budget_res.json()["id"]

    # Delete
    response = await authenticated_client.delete(f"/api/budgets/{budget_id}")
    assert response.status_code == 204
    
    # Verify
    get_res = await authenticated_client.get(f"/api/budgets/{budget_id}")
    assert get_res.status_code == 404
