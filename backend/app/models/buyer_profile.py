"""Modelo representando perfil do comprador com dados pessoais"""

from datetime import date, datetime

from sqlalchemy import BigInteger, Column, Date, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from app.database import Base


class BuyerProfile(Base):
    __tablename__ = "buyer_profiles"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )

    nome_completo = Column(String(255), nullable=False)
    data_nascimento = Column(Date, nullable=True)
    cpf = Column(String(14), nullable=True, unique=True, index=True)
    identidade = Column(String(20), nullable=True)
    estado_civil = Column(String(20), nullable=True)
    naturalidade = Column(String(100), nullable=True)
    endereco = Column(String(255), nullable=False)
    cep = Column(String(12), nullable=False)
    cidade = Column(String(100), nullable=False)
    estado = Column(String(2), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="buyer_profile")

