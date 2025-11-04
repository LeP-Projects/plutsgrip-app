"""
Modelo de Metas Financeiras
"""
from sqlalchemy import Column, String, Numeric, Integer, ForeignKey, DateTime, Text, Date, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import BaseModel


class Goal(Base, BaseModel):
    """
    Modelo de Meta Financeira

    Atributos:
        id: Identificador único
        user_id: Chave estrangeira para o usuário
        name: Nome da meta
        description: Descrição da meta
        target_amount: Valor alvo a ser atingido
        current_amount: Valor atual poupado/atingido
        deadline: Data limite para atingir a meta
        category: Categoria da meta (ex: poupança, viagem, carro)
        priority: Prioridade (baixa, média, alta)
        is_completed: Se a meta foi atingida
        created_at: Timestamp de criação
        updated_at: Timestamp de atualização
    """

    __tablename__ = "goals"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    target_amount = Column(Numeric(precision=10, scale=2), nullable=False)
    current_amount = Column(Numeric(precision=10, scale=2), default=0, nullable=False)
    deadline = Column(Date, nullable=True)
    category = Column(String(100), nullable=True)
    priority = Column(String(20), default="medium", nullable=False)  # low, medium, high
    is_completed = Column(Boolean, default=False, nullable=False)

    # Relacionamentos
    user = relationship("User", back_populates="goals")

    def __repr__(self):
        return f"<Goal(id={self.id}, name={self.name}, target_amount={self.target_amount})>"
