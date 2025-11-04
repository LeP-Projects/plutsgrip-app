"""
User model for authentication and user management
"""
from datetime import datetime

from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import BaseModel


class User(Base, BaseModel):
    """
    User model

    Attributes:
        id: Unique user identifier
        name: User's full name
        email: User's email (unique, used for login)
        hashed_password: Bcrypt hashed password
        created_at: Account creation timestamp
        updated_at: Last update timestamp
        transactions: Relationship to user's transactions
    """

    __tablename__ = "users"

    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    currency = Column(String(3), nullable=False, default="BRL")
    timezone = Column(String(50), nullable=False, default="UTC")
    deleted_at = Column(DateTime, nullable=True)


    # Relacionamentos
    transactions = relationship(
        "Transaction",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    categories = relationship(
        "Category",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    budgets = relationship(
        "Budget",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    recurring_transactions = relationship(
        "RecurringTransaction",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    goals = relationship(
        "Goal",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"
