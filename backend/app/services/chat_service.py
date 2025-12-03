"""Service para gerenciar Chat"""

from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.conversation import Conversation
from app.models.message import Message
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.message_repository import MessageRepository
from app.repositories.user_repository import UserRepository
from app.schemas.chat import (
    ConversationResponse,
    ConversationWithMessages,
    ConversationUserInfo,
    MessageResponse,
)


class ChatService:
    def __init__(self, db: Session):
        self.db = db
        self.conversation_repo = ConversationRepository(db)
        self.message_repo = MessageRepository(db)
        self.user_repo = UserRepository(db)

    def get_or_create_conversation(self, user1_id: int, user2_id: int) -> Conversation:
        """Busca ou cria conversa entre 2 usuários"""
        return self.conversation_repo.get_or_create(user1_id, user2_id)

    def send_message(self, conversation_id: int, sender_id: int, content: str) -> Message:
        """Envia uma mensagem"""
        # Cria mensagem
        message = self.message_repo.create(conversation_id, sender_id, content)

        # Atualiza timestamp da conversa
        self.conversation_repo.update_timestamp(conversation_id)

        return message

    def get_user_conversations(self, user_id: int) -> List[ConversationResponse]:
        """
        Retorna todas as conversas do usuário com informações do outro usuário
        e última mensagem.
        """
        conversations = self.conversation_repo.get_user_conversations(user_id)
        result = []

        for conv in conversations:
            # Pega ID do outro usuário
            other_user_id = self.conversation_repo.get_other_user_id(conv, user_id)
            other_user = self.user_repo.get_by_id(other_user_id)

            if not other_user:
                continue

            # Pega última mensagem
            last_message = self.message_repo.get_last_message(conv.id)

            # Conta mensagens não lidas
            unread_count = (
                self.db.query(Message)
                .filter(
                    Message.conversation_id == conv.id,
                    Message.sender_id != user_id,
                    Message.is_read == False
                )
                .count()
            )

            result.append(
                ConversationResponse(
                    id=conv.id,
                    other_user=ConversationUserInfo(
                        id=other_user.id,
                        email=other_user.email,
                        nickname=other_user.nickname,
                    ),
                    last_message=MessageResponse.from_orm(last_message) if last_message else None,
                    unread_count=unread_count,
                    created_at=conv.created_at,
                    updated_at=conv.updated_at,
                )
            )

        return result

    def get_conversation_with_messages(
        self, conversation_id: int, current_user_id: int, limit: int = 100, offset: int = 0
    ) -> Optional[ConversationWithMessages]:
        """
        Retorna conversa com todas as mensagens.
        Marca mensagens como lidas.
        """
        conversation = self.conversation_repo.get_by_id(conversation_id)
        if not conversation:
            return None

        # Verifica se usuário faz parte da conversa
        if current_user_id not in [conversation.user1_id, conversation.user2_id]:
            return None

        # Pega ID do outro usuário
        other_user_id = self.conversation_repo.get_other_user_id(conversation, current_user_id)
        other_user = self.user_repo.get_by_id(other_user_id)

        if not other_user:
            return None

        # Pega mensagens
        messages = self.message_repo.get_conversation_messages(conversation_id, limit, offset)

        # Marca mensagens como lidas
        self.message_repo.mark_as_read(conversation_id, current_user_id)

        return ConversationWithMessages(
            id=conversation.id,
            other_user=ConversationUserInfo(
                id=other_user.id,
                email=other_user.email,
                nickname=other_user.nickname,
            ),
            messages=[MessageResponse.from_orm(msg) for msg in messages],
            created_at=conversation.created_at,
            updated_at=conversation.updated_at,
        )

    def get_unread_count(self, user_id: int) -> int:
        """Retorna quantidade de mensagens não lidas do usuário"""
        return self.message_repo.count_unread_messages(user_id)

    def start_conversation_with_user(self, current_user_id: int, other_user_id: int) -> Conversation:
        """Inicia conversa com outro usuário (ou retorna existente)"""
        # Verifica se outro usuário existe
        other_user = self.user_repo.get_by_id(other_user_id)
        if not other_user:
            raise ValueError("Usuário não encontrado")

        return self.get_or_create_conversation(current_user_id, other_user_id)
