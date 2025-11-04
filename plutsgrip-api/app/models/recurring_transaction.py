"""
Modelo de Transações Recorrentes
"""
from sqlalchemy import Column, String, Numeric, Integer, ForeignKey, Enum, DateTime, Text, Date, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import BaseModel
from app.models.category import TransactionType
from enum import Enum as PyEnum


class RecurrenceFrequency(PyEnum):
    """Frequências de recorrência"""
    DAILY = "daily"
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"


class RecurringTransaction(Base, BaseModel):
    """
    Modelo de Transação Recorrente

    Atributos:
        id: Identificador único
        user_id: Chave estrangeira para o usuário
        description: Descrição da transação
        amount: Valor da transação
        currency: Código de moeda (ISO 4217)
        type: Tipo de transação (income ou expense)
        category_id: Chave estrangeira para a categoria
        frequency: Frequência de recorrência
        start_date: Data de início
        end_date: Data de término (opcional)
        next_execution_date: Data da próxima execução
        is_active: Se está ativa
        notes: Notas adicionais
        created_at: Timestamp de criação
        updated_at: Timestamp de atualização
    """

    __tablename__ = "recurring_transactions"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    description = Column(String(255), nullable=False)
    amount = Column(Numeric(precision=10, scale=2), nullable=False)
    currency = Column(String(3), nullable=True)
    type = Column(Enum(TransactionType), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    frequency = Column(Enum(RecurrenceFrequency), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    next_execution_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    notes = Column(Text, nullable=True)

    # Relacionamentos
    user = relationship("User", back_populates="recurring_transactions")
    category = relationship("Category", back_populates="recurring_transactions")

    def __repr__(self):
        return f"<RecurringTransaction(id={self.id}, description={self.description}, frequency={self.frequency})>"
