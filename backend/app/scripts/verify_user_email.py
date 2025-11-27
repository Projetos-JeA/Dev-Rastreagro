"""
Script para verificar email de usuário no banco de dados
Uso: python -m app.scripts.verify_user_email <email>
"""

import sys
from pathlib import Path

# Adiciona o diretório raiz ao path
root_dir = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(root_dir))

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import User


def verify_user_email(email: str) -> bool:
    """Marca email como verificado para um usuário"""
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ Usuário com email '{email}' não encontrado.")
            return False

        if user.email_verificado:
            print(f"✅ Email '{email}' já está verificado.")
            return True

        user.email_verificado = True
        db.commit()
        db.refresh(user)

        print(f"✅ Email '{email}' verificado com sucesso!")
        print(f"   ID: {user.id}")
        print(f"   Role: {user.role.value}")
        print(f"   Nickname: {user.nickname or 'N/A'}")
        return True
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao verificar email: {e}")
        return False
    finally:
        db.close()


def list_all_users():
    """Lista todos os usuários do banco"""
    db: Session = SessionLocal()
    try:
        users = db.query(User).all()
        if not users:
            print("❌ Nenhum usuário encontrado no banco.")
            return

        print(f"\n📋 Usuários no banco ({len(users)}):\n")
        for user in users:
            status = "✅ Verificado" if user.email_verificado else "❌ Não verificado"
            print(f"   {user.id} | {user.email} | {user.role.value} | {status}")
        print()
    except Exception as e:
        print(f"❌ Erro ao listar usuários: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("📋 Uso:")
        print("   python -m app.scripts.verify_user_email <email>")
        print("   python -m app.scripts.verify_user_email --list")
        print("\nExemplos:")
        print("   python -m app.scripts.verify_user_email usuario@email.com")
        print("   python -m app.scripts.verify_user_email --list")
        sys.exit(1)

    if sys.argv[1] == "--list":
        list_all_users()
    else:
        email = sys.argv[1]
        verify_user_email(email)

