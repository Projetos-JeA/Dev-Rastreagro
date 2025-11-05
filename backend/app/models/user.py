"""
User model
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from app.database import Base
import enum


class UserType(str, enum.Enum):
    CLIENTE = "cliente"
    EMPRESA = "empresa"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    tipo = Column(Enum(UserType), nullable=False)
    nome = Column(String(255), nullable=False)
    telefone = Column(String(20))
    cpf_cnpj = Column(String(20), unique=True, index=True)
    endereco = Column(String(500))
    two_fa_secret = Column(String(255))  # Secret para 2FA
    two_fa_enabled = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

