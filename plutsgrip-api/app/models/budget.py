"""
Modelo de Orçamento para controle de gastos por categoria
"""
from sqlalchemy import Column, String, Numeric, Integer, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import BaseModel
from enum import Enum as PyEnum


class BudgetPeriod(PyEnum):
    """Períodos de orçamento"""
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"


class Budget(Base, BaseModel):
    """
    Modelo de Orçamento

    Atributos:
        id: Identificador único do orçamento
        user_id: Chave estrangeira para o usuário
        category_id: Chave estrangeira para a categoria
        amount: Valor orçado
        period: Período do orçamento (monthly, quarterly, yearly)
        start_date: Data de início do orçamento
        notifications_enabled: Se as notificações estão habilitadas
        created_at: Timestamp de criação
        updated_at: Timestamp de atualização
    """

    __tablename__ = "budgets"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(precision=10, scale=2), nullable=False)
    period = Column(Enum(BudgetPeriod), nullable=False, default=BudgetPeriod.MONTHLY)
    start_date = Column(DateTime, nullable=False)
    notifications_enabled = Column(Integer, default=True)

    # Relacionamentos
    user = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets")

    def __repr__(self):
        return f"<Budget(id={self.id}, category_id={self.category_id}, amount={self.amount}, period={self.period})>"
