"""Repository para Conversas"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc

from app.models.conversation import Conversation
from app.models.message import Message


class ConversationRepository:
    def __init__(self, db: Session):
        self.db = db
        self.model = Conversation

    def create(self, user1_id: int, user2_id: int) -> Conversation:
        """Cria uma nova conversa entre 2 usuários"""
        conversation = Conversation(
            user1_id=user1_id,
            user2_id=user2_id
        )
        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)
        return conversation

    def get_by_id(self, conversation_id: int) -> Optional[Conversation]:
        """Busca conversa por ID"""
        return self.db.query(Conversation).filter(Conversation.id == conversation_id).first()

    def get_or_create(self, user1_id: int, user2_id: int) -> Conversation:
        """
        Busca ou cria conversa entre 2 usuários.
        Garante que a ordem dos usuários não importa.
        """
        # Normaliza: sempre coloca o menor ID primeiro
        if user1_id > user2_id:
            user1_id, user2_id = user2_id, user1_id

        # Busca conversa existente
        conversation = self.db.query(Conversation).filter(
            and_(
                Conversation.user1_id == user1_id,
                Conversation.user2_id == user2_id
            )
        ).first()

        if conversation:
            return conversation

        # Cria nova conversa
        return self.create(user1_id, user2_id)

    def get_user_conversations(self, user_id: int) -> List[Conversation]:
        """
        Busca todas as conversas de um usuário.
        Ordena por última mensagem (mais recente primeiro).
        """
        return (
            self.db.query(Conversation)
            .filter(
                or_(
                    Conversation.user1_id == user_id,
                    Conversation.user2_id == user_id
                )
            )
            .order_by(desc(Conversation.updated_at))
            .all()
        )

    def update_timestamp(self, conversation_id: int):
        """Atualiza o timestamp da conversa (quando nova mensagem é enviada)"""
        from datetime import datetime
        self.db.query(Conversation).filter(Conversation.id == conversation_id).update({
            "updated_at": datetime.utcnow()
        })
        self.db.commit()

    def get_other_user_id(self, conversation: Conversation, current_user_id: int) -> int:
        """Retorna o ID do outro usuário na conversa"""
        return conversation.user2_id if conversation.user1_id == current_user_id else conversation.user1_id

    def has_unread_messages(self, conversation_id: int, user_id: int) -> bool:
        """Verifica se há mensagens não lidas para o usuário"""
        return (
            self.db.query(Message)
            .filter(
                and_(
                    Message.conversation_id == conversation_id,
                    Message.sender_id != user_id,
                    Message.is_read == False
                )
            )
            .count() > 0
        )
