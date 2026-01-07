"""
Category model for transaction categorization
"""
from sqlalchemy import Column, String, Enum, Boolean, DateTime, Integer, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import BaseModel
import enum


class TransactionType(str, enum.Enum):
    """Transaction type enumeration"""
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"


class Category(Base, BaseModel):
    """
    Category model

    Attributes:
        id: Unique category identifier
        name: Category name
        type: Category type (income or expense)
        color: Hex color code for UI display
        icon: Icon identifier for UI display
        created_at: Creation timestamp
        updated_at: Last update timestamp
        transactions: Relationship to transactions in this category
    """

    __tablename__ = "categories"

    __table_args__ = (
        CheckConstraint("color ~ '^#[0-9A-Fa-f]{6}$'", name='check_color_format'),
        Index('ix_categories_user_id', 'user_id'),
        Index('ix_categories_type', 'type'),
        Index('ix_categories_is_default', 'is_default'),
    )

    name = Column(String(100), nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    color = Column(String(7), nullable=True)  # Hex color: #RRGGBB
    icon = Column(String(50), nullable=True)
    is_default = Column(Boolean, nullable=False, default=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    deleted_at = Column(DateTime, nullable=True)

    # Relacionamentos
    transactions = relationship(
        "Transaction",
        back_populates="category",
        lazy="selectin"
    )
    user = relationship(
        "User",
        back_populates="categories",
    )
    budgets = relationship(
        "Budget",
        back_populates="category",
        lazy="selectin"
    )
    recurring_transactions = relationship(
        "RecurringTransaction",
        back_populates="category",
        lazy="selectin"
    )

    def __repr__(self):
        return f"<Category(id={self.id}, name={self.name}, type={self.type})>"
