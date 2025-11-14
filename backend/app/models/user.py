"""Modelo representando usuários do sistema"""

from datetime import datetime
from enum import Enum

from sqlalchemy import BigInteger, Column, DateTime, Enum as SQLEnum, String
from sqlalchemy.orm import relationship

from app.database import Base


class UserRole(str, Enum):
    BUYER = "buyer"
    SELLER = "seller"
    SERVICE_PROVIDER = "service_provider"


class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole, name="user_role"), nullable=False)
    nickname = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    company = relationship("Company", back_populates="user", uselist=False)
    service_profile = relationship("ServiceProvider", back_populates="user", uselist=False)
