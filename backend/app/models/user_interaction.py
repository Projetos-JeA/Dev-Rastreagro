"""Modelo para rastrear interações do usuário com cotações"""

from datetime import datetime
from enum import Enum

from sqlalchemy import BigInteger, Column, DateTime, Enum as SQLEnum, ForeignKey, String
from sqlalchemy.orm import relationship

from app.database import Base


class InteractionType(str, Enum):
    VIEW = "view"  # Visualizou detalhes
    FAVORITE = "favorite"  # Favoritou
    CLICK = "click"  # Clicou no card
    ACCEPTED = "accepted"  # Aceitou match
    REJECTED = "rejected"  # Rejeitou match
    PURCHASED = "purchased"  # Comprou


class UserInteraction(Base):
    __tablename__ = "user_interactions"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    quotation_id = Column(BigInteger, ForeignKey("quotations.id", ondelete="CASCADE"), nullable=False, index=True)
    interaction_type = Column(SQLEnum(InteractionType, name="interaction_type"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", backref="interactions")
    quotation = relationship("Quotation", backref="interactions")

