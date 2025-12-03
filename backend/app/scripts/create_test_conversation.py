"""Script para criar conversa de teste entre dois usuários"""

import sys
from pathlib import Path

# Adiciona o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.database import SessionLocal
from app.models.user import User
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.message_repository import MessageRepository

def create_test_conversation():
    db = SessionLocal()
    try:
        conversation_repo = ConversationRepository(db)
        message_repo = MessageRepository(db)

        # Lista todos os usuários
        print("\nUsuarios disponiveis no banco:\n")
        users = db.query(User).all()

        if len(users) < 2:
            print("Erro: E necessario ter pelo menos 2 usuarios no banco!")
            return

        for i, user in enumerate(users, 1):
            print(f"{i}. ID: {user.id} | Email: {user.email} | Nickname: {user.nickname}")

        # Pega os dois primeiros usuários (ou você pode escolher)
        user1 = users[0]
        user2 = users[1]

        print(f"\nCriando conversa entre:")
        print(f"   {user1.nickname or user1.email} (ID: {user1.id})")
        print(f"   {user2.nickname or user2.email} (ID: {user2.id})")

        # Cria ou busca conversa existente
        conversation = conversation_repo.get_or_create(user1.id, user2.id)
        print(f"\nConversa criada/encontrada! ID: {conversation.id}")

        # Cria mensagens de teste
        messages_to_create = [
            (user1.id, "Ola! Tudo bem?"),
            (user2.id, "Oi! Tudo otimo, e voce?"),
            (user1.id, "Tudo bem tambem! Estou testando o sistema de chat."),
            (user2.id, "Que legal! Esta funcionando perfeitamente!"),
            (user1.id, "Sim, ficou muito bom!"),
            (user2.id, "Vamos fazer negocio?"),
            (user1.id, "Claro! Tenho interesse na sua cotacao de soja."),
            (user2.id, "Otimo! Posso te enviar mais detalhes."),
        ]

        print(f"\nCriando {len(messages_to_create)} mensagens de teste...\n")

        for sender_id, content in messages_to_create:
            sender = user1 if sender_id == user1.id else user2
            message = message_repo.create(conversation.id, sender_id, content)
            print(f"   {sender.nickname or sender.email}: {content}")

        # Atualiza timestamp da conversa
        conversation_repo.update_timestamp(conversation.id)

        print(f"\nConversa de teste criada com sucesso!")
        print(f"\nPara testar:")
        print(f"   1. Faca login com: {user1.email}")
        print(f"   2. Va em 'Mensagens'")
        print(f"   3. Voce vera a conversa com {user2.nickname or user2.email}")
        print(f"\n   Ou faca o inverso logando com {user2.email}")

    except Exception as e:
        print(f"\nErro: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_conversation()
