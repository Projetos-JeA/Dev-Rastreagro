"""Repository para Mensagens"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.message import Message


class MessageRepository:
    def __init__(self, db: Session):
        self.db = db
        self.model = Message

    def create(self, conversation_id: int, sender_id: int, content: str) -> Message:
        """Cria uma nova mensagem"""
        message = Message(
            conversation_id=conversation_id,
            sender_id=sender_id,
            content=content,
            is_read=False
        )
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        return message

    def get_by_id(self, message_id: int) -> Optional[Message]:
        """Busca mensagem por ID"""
        return self.db.query(Message).filter(Message.id == message_id).first()

    def get_conversation_messages(self, conversation_id: int, limit: int = 100, offset: int = 0) -> List[Message]:
        """
        Busca mensagens de uma conversa.
        Ordenadas da mais antiga para a mais recente.
        """
        return (
            self.db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .limit(limit)
            .offset(offset)
            .all()
        )

    def mark_as_read(self, conversation_id: int, user_id: int):
        """Marca todas as mensagens de uma conversa como lidas (exceto as do próprio usuário)"""
        self.db.query(Message).filter(
            and_(
                Message.conversation_id == conversation_id,
                Message.sender_id != user_id,
                Message.is_read == False
            )
        ).update({"is_read": True})
        self.db.commit()

    def count_unread_messages(self, user_id: int) -> int:
        """Conta mensagens não lidas do usuário"""
        from app.models.conversation import Conversation
        from sqlalchemy import or_

        return (
            self.db.query(Message)
            .join(Conversation)
            .filter(
                and_(
                    or_(
                        Conversation.user1_id == user_id,
                        Conversation.user2_id == user_id
                    ),
                    Message.sender_id != user_id,
                    Message.is_read == False
                )
            )
            .count()
        )

    def get_last_message(self, conversation_id: int) -> Optional[Message]:
        """Retorna a última mensagem de uma conversa"""
        return (
            self.db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .first()
        )
