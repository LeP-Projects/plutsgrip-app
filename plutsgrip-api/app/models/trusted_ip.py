"""
Modelo de IP Confiável para bypass de rate limiting
"""
from sqlalchemy import Column, String, Boolean, DateTime, Text
from app.core.database import Base
from app.models.base import BaseModel


class TrustedIP(Base, BaseModel):
    """
    Modelo de IP Confiável

    Atributos:
        id: Identificador único
        ip_address: Endereço IP (IPv4 ou IPv6)
        description: Descrição/razão para confiar neste IP
        is_active: Se o IP está ativo na whitelist
        created_at: Timestamp de criação
        updated_at: Timestamp de atualização
    """

    __tablename__ = "trusted_ips"

    ip_address = Column(String(45), nullable=False, unique=True, index=True)  # IPv6 max: 39 chars
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    def __repr__(self):
        return f"<TrustedIP(id={self.id}, ip_address={self.ip_address}, is_active={self.is_active})>"
