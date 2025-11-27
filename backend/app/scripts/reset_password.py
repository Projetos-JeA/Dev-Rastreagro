"""
Script para resetar senha de usuário no banco de dados
Uso: python -m app.scripts.reset_password <email> <nova_senha>
"""

import sys
from pathlib import Path

# Adiciona o diretório raiz ao path
root_dir = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(root_dir))

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.database import SessionLocal
from app.models import User


def reset_user_password(email: str, new_password: str) -> bool:
    """Reseta a senha de um usuário"""
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ Usuário com email '{email}' não encontrado.")
            return False

        # Gera hash da nova senha
        password_hash = get_password_hash(new_password)
        user.password_hash = password_hash
        db.commit()
        db.refresh(user)

        print(f"✅ Senha resetada com sucesso para '{email}'!")
        print(f"   ID: {user.id}")
        print(f"   Role: {user.role.value}")
        print(f"   Nickname: {user.nickname or 'N/A'}")
        print(f"   Nova senha: {new_password}")
        return True
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao resetar senha: {e}")
        return False
    finally:
        db.close()


def find_user_by_email(email: str):
    """Busca usuário por email e mostra informações"""
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ Usuário com email '{email}' não encontrado.")
            return None

        print(f"\n📋 Informações do usuário:")
        print(f"   ID: {user.id}")
        print(f"   Email: {user.email}")
        print(f"   Role: {user.role.value}")
        print(f"   Nickname: {user.nickname or 'N/A'}")
        print(f"   Email verificado: {'✅ Sim' if user.email_verificado else '❌ Não'}")
        print(f"   Criado em: {user.created_at}")
        print()
        return user
    except Exception as e:
        print(f"❌ Erro ao buscar usuário: {e}")
        return None
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("📋 Uso:")
        print("   python -m app.scripts.reset_password <email> <nova_senha>")
        print("   python -m app.scripts.reset_password <email> --info")
        print("\nExemplos:")
        print("   python -m app.scripts.reset_password usuario@email.com MinhaNovaSenha123")
        print("   python -m app.scripts.reset_password usuario@email.com --info")
        sys.exit(1)

    email = sys.argv[1]

    if len(sys.argv) == 3 and sys.argv[2] == "--info":
        find_user_by_email(email)
    elif len(sys.argv) == 3:
        new_password = sys.argv[2]
        reset_user_password(email, new_password)
    else:
        print("❌ Erro: Forneça a nova senha ou use --info para ver informações do usuário")
        sys.exit(1)

