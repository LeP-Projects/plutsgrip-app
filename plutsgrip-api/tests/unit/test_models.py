"""
Unit tests for database models
"""
import pytest
from datetime import date
from decimal import Decimal
from app.models.user import User
from app.models.category import Category, TransactionType
from app.models.transaction import Transaction


def test_user_model():
    """Test User model creation"""
    user = User(
        name="John Doe",
        email="john@example.com",
        hashed_password="hashedpassword123"
    )

    assert user.name == "John Doe"
    assert user.email == "john@example.com"
    assert user.hashed_password == "hashedpassword123"


def test_category_model():
    """Test Category model creation"""
    category = Category(
        name="Groceries",
        type=TransactionType.EXPENSE,
        color="#FF5733",
        icon="shopping-cart"
    )

    assert category.name == "Groceries"
    assert category.type == TransactionType.EXPENSE
    assert category.color == "#FF5733"
    assert category.icon == "shopping-cart"


def test_transaction_model():
    """Test Transaction model creation"""
    transaction = Transaction(
        user_id=1,
        description="Supermarket shopping",
        amount=Decimal("150.50"),
        date=date(2024, 1, 15),
        category_id=1,
        type=TransactionType.EXPENSE,
        notes="Weekly groceries"
    )

    assert transaction.user_id == 1
    assert transaction.description == "Supermarket shopping"
    assert transaction.amount == Decimal("150.50")
    assert transaction.type == TransactionType.EXPENSE
    assert transaction.notes == "Weekly groceries"


# TODO: Add more model tests
# - Test model relationships
# - Test model validations
# - Test model methods
