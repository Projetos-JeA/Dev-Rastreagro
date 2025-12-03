"""Schemas para Chat (Conversas e Mensagens)"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ============================================================================
# MESSAGE SCHEMAS
# ============================================================================

class MessageCreate(BaseModel):
    """Schema para criar mensagem"""
    content: str = Field(..., min_length=1, max_length=5000, description="Conteúdo da mensagem")


class MessageResponse(BaseModel):
    """Schema de resposta para mensagem"""
    id: int
    conversation_id: int
    sender_id: int
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# CONVERSATION SCHEMAS
# ============================================================================

class ConversationCreate(BaseModel):
    """Schema para criar conversa"""
    other_user_id: int = Field(..., description="ID do outro usuário")


class ConversationUserInfo(BaseModel):
    """Informações básicas do outro usuário"""
    id: int
    email: str
    nickname: Optional[str] = None


class ConversationResponse(BaseModel):
    """Schema de resposta para conversa"""
    id: int
    other_user: ConversationUserInfo
    last_message: Optional[MessageResponse] = None
    unread_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationWithMessages(BaseModel):
    """Schema de conversa com todas as mensagens"""
    id: int
    other_user: ConversationUserInfo
    messages: list[MessageResponse]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
