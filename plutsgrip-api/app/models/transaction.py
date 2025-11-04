"""
Transaction model for financial transactions
"""
from sqlalchemy import Column, String, Numeric, Date, Integer, ForeignKey, Enum, Text, Boolean, DateTime, CheckConstraint, Index
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import BaseModel
from app.models.category import TransactionType


class Transaction(Base, BaseModel):
    """
    Transaction model

    Attributes:
        id: Unique transaction identifier
        user_id: Foreign key to user who owns this transaction
        description: Transaction description
        amount: Transaction amount (Decimal for precision)
        currency: Currency code (ISO 4217, e.g., 'BRL', 'USD')
        date: Transaction date
        type: Transaction type (income or expense)
        notes: Optional additional notes
        tags: Optional comma-separated tags for categorization
        is_recurring: Flag indicating if this transaction is recurring
        recurring_transaction_id: Foreign key to recurring transaction template
        category_id: Foreign key to transaction category
        deleted_at: Soft delete timestamp
        created_at: Creation timestamp
        updated_at: Last update timestamp
        user: Relationship to user
        category: Relationship to category
    """

    __tablename__ = "transactions"

    __table_args__ = (
        CheckConstraint("amount > 0", name='check_amount_positive'),
        Index('ix_transactions_user_id_date', 'user_id', 'date', postgresql_using='btree', postgresql_ops={'date': 'DESC'}),
        Index('ix_transactions_user_id_type', 'user_id', 'type'),
        Index('ix_transactions_user_id_category_id', 'user_id', 'category_id'),
        Index('ix_transactions_recurring_transaction_id', 'recurring_transaction_id'),
    )

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    description = Column(String(255), nullable=False)
    amount = Column(Numeric(precision=10, scale=2), nullable=False)
    currency = Column(String(3), nullable=True)
    date = Column(Date, nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    notes = Column(Text, nullable=True)
    tags = Column(String(255), nullable=True)
    is_recurring = Column(Boolean, nullable=False, default=False)
    # TODO: Uncomment when recurring_transactions table is implemented
    # recurring_transaction_id = Column(Integer, ForeignKey("recurring_transactions.id", ondelete="SET NULL"), nullable=True)
    recurring_transaction_id = Column(Integer, nullable=True)  # Temporary: no FK constraint
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")

    def __repr__(self):
        return f"<Transaction(id={self.id}, type={self.type}, amount={self.amount}, description={self.description})>"
