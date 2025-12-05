"""
Script para marcar todos os usuários como verificados (email_verificado = 1)
Uso: python -m app.scripts.verify_all_users
"""

import sys
from pathlib import Path

# Adiciona o diretório raiz ao path
root_dir = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(root_dir))

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User


def verify_all_users():
    """Marca todos os usuários como verificados"""
    db: Session = SessionLocal()
    try:
        # Busca todos os usuários
        users = db.query(User).all()
        
        if not users:
            print("❌ Nenhum usuário encontrado no banco")
            return
        
        # Marca todos como verificados
        updated = 0
        for user in users:
            if not user.email_verificado:
                user.email_verificado = True
                updated += 1
        
        db.commit()
        
        print(f"✅ {len(users)} usuários encontrados")
        print(f"✅ {updated} usuários marcados como verificados")
        print(f"✅ Todos os usuários agora têm email_verificado = 1")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao verificar usuários: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    verify_all_users()

