"""Rotas para Chat (Conversas e Mensagens)"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.chat import (
    ConversationCreate,
    ConversationResponse,
    ConversationWithMessages,
    MessageCreate,
    MessageResponse,
)
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.get("/conversations", response_model=List[ConversationResponse], summary="Lista conversas do usuário")
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retorna todas as conversas do usuário logado.
    Inclui informações do outro usuário, última mensagem e contador de não lidas.
    """
    service = ChatService(db)
    return service.get_user_conversations(current_user.id)


@router.post("/conversations", response_model=ConversationResponse, summary="Inicia conversa com usuário")
def start_conversation(
    data: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Inicia uma conversa com outro usuário.
    Se já existe conversa, retorna a existente.
    """
    if data.other_user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível iniciar conversa consigo mesmo"
        )

    service = ChatService(db)

    try:
        conversation = service.start_conversation_with_user(current_user.id, data.other_user_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

    # Retorna conversa formatada
    conversations = service.get_user_conversations(current_user.id)
    for conv in conversations:
        if conv.id == conversation.id:
            return conv

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Erro ao criar conversa"
    )


@router.get("/conversations/{conversation_id}", response_model=ConversationWithMessages, summary="Detalhes da conversa com mensagens")
def get_conversation(
    conversation_id: int,
    limit: int = Query(100, ge=1, le=500, description="Limite de mensagens"),
    offset: int = Query(0, ge=0, description="Offset para paginação"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retorna conversa com todas as mensagens.
    Marca automaticamente as mensagens como lidas.
    """
    service = ChatService(db)
    conversation = service.get_conversation_with_messages(conversation_id, current_user.id, limit, offset)

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversa não encontrada ou você não tem permissão"
        )

    return conversation


@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse, summary="Envia mensagem")
def send_message(
    conversation_id: int,
    data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Envia uma mensagem em uma conversa.
    Atualiza o timestamp da conversa.
    """
    service = ChatService(db)

    # Verifica se conversa existe e usuário faz parte dela
    conversation = service.conversation_repo.get_by_id(conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversa não encontrada"
        )

    if current_user.id not in [conversation.user1_id, conversation.user2_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não faz parte desta conversa"
        )

    # Envia mensagem
    message = service.send_message(conversation_id, current_user.id, data.content)
    return MessageResponse.from_orm(message)


@router.get("/unread-count", summary="Contador de mensagens não lidas")
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retorna quantidade total de mensagens não lidas do usuário.
    Útil para badge de notificação.
    """
    service = ChatService(db)
    count = service.get_unread_count(current_user.id)
    return {"unread_count": count}
