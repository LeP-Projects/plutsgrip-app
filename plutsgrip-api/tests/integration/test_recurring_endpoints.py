"""
Integration tests for recurring transaction endpoints
"""
import pytest
from httpx import AsyncClient
from datetime import date

@pytest.mark.asyncio
async def test_create_recurring_transaction(authenticated_client: AsyncClient):
    """Test creating a recurring transaction"""
    # Create category first
    cat_res = await authenticated_client.post("/api/categories", json={
        "name": "Recurring Cat", "type": "expense", "color": "#000000", "icon": "r"
    })
    cat_id = cat_res.json()["id"]

    recurring_data = {
        "description": "Weekly Rent",
        "amount": "500.00",
        "type": "expense",
        "category_id": cat_id,
        "frequency": "WEEKLY",
        "start_date": str(date.today()),
        "is_active": True
    }

    response = await authenticated_client.post("/api/recurring-transactions", json=recurring_data)
    assert response.status_code == 201
    data = response.json()
    assert data["frequency"] == "weekly"
    assert data["next_execution_date"] >= str(date.today())

@pytest.mark.asyncio
async def test_list_recurring_transactions(authenticated_client: AsyncClient):
    """Test listing recurring transactions"""
    response = await authenticated_client.get("/api/recurring-transactions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

@pytest.mark.asyncio
async def test_delete_recurring_transaction(authenticated_client: AsyncClient):
    """Test deleting a recurring transaction"""
    # Create one
    cat_res = await authenticated_client.post("/api/categories", json={"name": "Del Rec", "type": "expense", "color": "#000000", "icon": "d"})
    cat_id = cat_res.json()["id"]
    
    res = await authenticated_client.post("/api/recurring-transactions", json={
        "description": "To Delete",
        "amount": 10.0,
        "type": "expense",
        "category_id": cat_id,
        "frequency": "MONTHLY",
        "start_date": str(date.today())
    })
    rec_id = res.json()["id"]

    # Delete
    response = await authenticated_client.delete(f"/api/recurring-transactions/{rec_id}")
    assert response.status_code == 204

    # Verify
    get_res = await authenticated_client.get(f"/api/recurring-transactions/{rec_id}")
    assert get_res.status_code == 404
