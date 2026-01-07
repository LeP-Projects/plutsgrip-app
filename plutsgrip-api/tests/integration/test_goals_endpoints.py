"""
Integration tests for goal endpoints
"""
import pytest
from httpx import AsyncClient
from datetime import date, timedelta

@pytest.mark.asyncio
async def test_create_goal(authenticated_client: AsyncClient):
    """Test goal creation"""
    goal_data = {
        "name": "New Car",
        "description": "Saving for a Tesla",
        "target_amount": 50000.00,
        "deadline": str(date.today() + timedelta(days=365)),
        "priority": "HIGH",
        "category": "Transport" # Assuming string or ID? Init-db had 'category VARCHAR(100)'
    }
    
    response = await authenticated_client.post("/api/goals", json=goal_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == goal_data["name"]
    assert float(data["target_amount"]) == 50000.00
    assert data["current_amount"] == 0

@pytest.mark.asyncio
async def test_list_goals(authenticated_client: AsyncClient):
    """Test listing goals"""
    create_data = {
        "name": "Listable Goal",
        "target_amount": 1000.0,
        "priority": "LOW",
        "category": "Misc"
    }
    await authenticated_client.post("/api/goals", json=create_data)

    response = await authenticated_client.get("/api/goals")
    assert response.status_code == 200
    data = response.json()
    # Assume list or {goals: []}
    if isinstance(data, dict) and "goals" in data:
        assert isinstance(data["goals"], list)
        assert len(data["goals"]) > 0
    else:
        assert isinstance(data, list)
        assert len(data) > 0

@pytest.mark.asyncio
async def test_update_goal(authenticated_client: AsyncClient):
    """Test updating a goal (e.g. adding amount)"""
    create_res = await authenticated_client.post("/api/goals", json={
        "name": "Update Goal", "target_amount": 2000.0, "priority": "MEDIUM", "category": "Test"
    })
    goal_id = create_res.json()["id"]

    update_data = {
        "current_amount": 500.0,
        "name": "Updated Goal Name"
    }
    
    response = await authenticated_client.put(f"/api/goals/{goal_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert float(data["current_amount"]) == 500.0
    assert data["name"] == "Updated Goal Name"

@pytest.mark.asyncio
async def test_delete_goal(authenticated_client: AsyncClient):
    """Test deleting a goal"""
    create_res = await authenticated_client.post("/api/goals", json={
        "name": "Delete Goal", "target_amount": 100.0, "priority": "low", "category": "del"
    })
    goal_id = create_res.json()["id"]

    response = await authenticated_client.delete(f"/api/goals/{goal_id}")
    assert response.status_code == 204

    # Verify
    get_res = await authenticated_client.get(f"/api/goals/{goal_id}")
    assert get_res.status_code == 404
