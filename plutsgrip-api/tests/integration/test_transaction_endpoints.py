"""
Integration tests for transaction endpoints
"""
import pytest
from httpx import AsyncClient
from datetime import date


@pytest.mark.asyncio
async def test_create_transaction(authenticated_client: AsyncClient):
    """Test transaction creation"""
    transaction_data = {
        "description": "Monthly salary",
        "amount": "5000.00",
        "date": str(date.today()),
        "type": "income",
        "notes": "Salary for January"
    }

    response = await authenticated_client.post("/api/transactions", json=transaction_data)

    assert response.status_code == 201
    data = response.json()
    assert data["description"] == transaction_data["description"]
    assert data["type"] == transaction_data["type"]
    assert float(data["amount"]) == 5000.00


@pytest.mark.asyncio
async def test_list_transactions(authenticated_client: AsyncClient):
    """Test listing transactions"""
    # First, create a transaction
    transaction_data = {
        "description": "Test expense",
        "amount": "100.00",
        "date": str(date.today()),
        "type": "expense",
    }

    await authenticated_client.post("/api/transactions", json=transaction_data)

    # Now list transactions
    response = await authenticated_client.get("/api/transactions")

    assert response.status_code == 200
    data = response.json()
    assert "transactions" in data
    assert "total" in data
    assert data["total"] >= 1


@pytest.mark.asyncio
async def test_get_transaction(authenticated_client: AsyncClient):
    """Test getting a specific transaction"""
    # Create a transaction
    transaction_data = {
        "description": "Test transaction",
        "amount": "250.00",
        "date": str(date.today()),
        "type": "income",
    }

    create_response = await authenticated_client.post("/api/transactions", json=transaction_data)
    transaction_id = create_response.json()["id"]

    # Get the transaction
    response = await authenticated_client.get(f"/api/transactions/{transaction_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == transaction_id
    assert data["description"] == transaction_data["description"]


@pytest.mark.asyncio
async def test_update_transaction(authenticated_client: AsyncClient):
    """Test updating a transaction"""
    # Create a transaction
    transaction_data = {
        "description": "Original description",
        "amount": "100.00",
        "date": str(date.today()),
        "type": "expense",
    }

    create_response = await authenticated_client.post("/api/transactions", json=transaction_data)
    transaction_id = create_response.json()["id"]

    # Update the transaction
    update_data = {
        "description": "Updated description",
        "amount": "150.00"
    }

    response = await authenticated_client.put(f"/api/transactions/{transaction_id}", json=update_data)

    assert response.status_code == 200
    data = response.json()
    assert data["description"] == update_data["description"]
    assert float(data["amount"]) == 150.00


@pytest.mark.asyncio
async def test_delete_transaction(authenticated_client: AsyncClient):
    """Test deleting a transaction"""
    # Create a transaction
    transaction_data = {
        "description": "Transaction to delete",
        "amount": "100.00",
        "date": str(date.today()),
        "type": "expense",
    }

    create_response = await authenticated_client.post("/api/transactions", json=transaction_data)
    transaction_id = create_response.json()["id"]

    # Delete the transaction
    response = await authenticated_client.delete(f"/api/transactions/{transaction_id}")

    assert response.status_code == 204

    # Verify it's deleted
    get_response = await authenticated_client.get(f"/api/transactions/{transaction_id}")
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_filter_transactions_by_type(authenticated_client: AsyncClient):
    """Test filtering transactions by type"""
    # Create income and expense transactions
    income_data = {
        "description": "Income",
        "amount": "5000.00",
        "date": str(date.today()),
        "type": "income",
    }

    expense_data = {
        "description": "Expense",
        "amount": "100.00",
        "date": str(date.today()),
        "type": "expense",
    }

    await authenticated_client.post("/api/transactions", json=income_data)
    await authenticated_client.post("/api/transactions", json=expense_data)

    # Filter by income
    response = await authenticated_client.get("/api/transactions?type=income")

    assert response.status_code == 200
    data = response.json()
    for transaction in data["transactions"]:
        assert transaction["type"] == "income"


@pytest.mark.asyncio
async def test_pagination(authenticated_client: AsyncClient):
    """Test pagination of transactions"""
    # Create multiple transactions
    for i in range(5):
        transaction_data = {
            "description": f"Transaction {i}",
            "amount": f"{100 + i}.00",
            "date": str(date.today()),
            "type": "expense",
        }
        await authenticated_client.post("/api/transactions", json=transaction_data)

    # Test pagination with page_size=2
    response = await authenticated_client.get("/api/transactions?page=1&page_size=2")

    assert response.status_code == 200
    data = response.json()
    assert len(data["transactions"]) == 2
    assert data["page"] == 1
    assert data["page_size"] == 2


@pytest.mark.asyncio
async def test_pagination_respects_filtered_total_and_date_range(authenticated_client: AsyncClient):
    """Test that pagination keeps the filtered total when date filters are applied"""
    transactions = [
        {
            "description": "Expense in range 1",
            "amount": "120.00",
            "date": "2026-03-10",
            "type": "expense",
        },
        {
            "description": "Expense in range 2",
            "amount": "220.00",
            "date": "2026-03-11",
            "type": "expense",
        },
        {
            "description": "Expense in range 3",
            "amount": "320.00",
            "date": "2026-03-12",
            "type": "expense",
        },
        {
            "description": "Expense out of range",
            "amount": "420.00",
            "date": "2026-02-28",
            "type": "expense",
        },
    ]

    for transaction in transactions:
        await authenticated_client.post("/api/transactions", json=transaction)

    response = await authenticated_client.get(
        "/api/transactions?page=1&page_size=2&start_date=2026-03-10&end_date=2026-03-12"
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["transactions"]) == 2
    assert data["total"] == 3
    assert data["page"] == 1
    assert data["page_size"] == 2

    returned_dates = {transaction["date"] for transaction in data["transactions"]}
    assert returned_dates.issubset({"2026-03-10", "2026-03-11", "2026-03-12"})
