"""Modelo de Conversa entre usuários"""

from datetime import datetime
from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship

from app.database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(BigInteger, primary_key=True, index=True)
    user1_id = Column(BigInteger, ForeignKey("users.id", ondelete="NO ACTION"), nullable=False)
    user2_id = Column(BigInteger, ForeignKey("users.id", ondelete="NO ACTION"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user1 = relationship("User", foreign_keys=[user1_id], backref="conversations_as_user1")
    user2 = relationship("User", foreign_keys=[user2_id], backref="conversations_as_user2")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")

    # Índice composto para buscar conversas entre 2 usuários rapidamente
    __table_args__ = (
        Index('ix_conversation_users', 'user1_id', 'user2_id'),
    )
