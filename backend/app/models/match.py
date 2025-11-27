"""Modelo representando matches (Deu Agro) do sistema"""

from datetime import datetime
from enum import Enum

from sqlalchemy import BigInteger, Column, DateTime, Enum as SQLEnum, Float, ForeignKey, String
from sqlalchemy.orm import relationship

from app.database import Base


class MatchStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Match(Base):
    __tablename__ = "matches"

    id = Column(BigInteger, primary_key=True, index=True)
    quotation_id = Column(BigInteger, ForeignKey("quotations.id"), nullable=False, index=True)
    buyer_id = Column(BigInteger, ForeignKey("users.id"), nullable=False, index=True)
    score = Column(Float, nullable=True)  # Score de relevância calculado pela IA (0-100)
    status = Column(
        SQLEnum(MatchStatus, name="match_status"), default=MatchStatus.PENDING, nullable=False
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    quotation = relationship("Quotation", back_populates="matches")
    buyer = relationship("User", backref="matches")

