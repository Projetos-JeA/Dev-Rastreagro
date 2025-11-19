"""Modelo para tokens de verificação de email"""

from datetime import datetime

from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from app.database import Base


class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    token = Column(String(255), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="email_verification_token")

