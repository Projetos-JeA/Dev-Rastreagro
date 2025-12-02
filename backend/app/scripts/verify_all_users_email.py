"""Script para verificar emails de todos os usuários (útil para testes)"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.database import SessionLocal
from app.models.user import User


def verify_all_users_email():
    """Marca todos os emails como verificados"""
    print("=" * 60)
    print("🔧 VERIFICANDO EMAILS DE TODOS OS USUÁRIOS")
    print("=" * 60)
    print()
    
    db = SessionLocal()
    try:
        users = db.query(User).all()
        
        if not users:
            print("❌ Nenhum usuário encontrado no banco de dados.")
            return
        
        print(f"📊 Total de usuários encontrados: {len(users)}\n")
        
        verified_count = 0
        already_verified = 0
        
        for user in users:
            if user.email_verificado:
                already_verified += 1
                print(f"✅ {user.email} - Já verificado")
            else:
                user.email_verificado = True
                verified_count += 1
                print(f"🔓 {user.email} - Verificado agora")
        
        if verified_count > 0:
            db.commit()
            print()
            print("=" * 60)
            print(f"✅ {verified_count} usuário(s) verificado(s) com sucesso!")
            print(f"ℹ️  {already_verified} usuário(s) já estavam verificados")
            print("=" * 60)
        else:
            print()
            print("=" * 60)
            print(f"ℹ️  Todos os {already_verified} usuários já estavam verificados")
            print("=" * 60)
            
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao verificar emails: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    print("\n⚠️  ATENÇÃO: Este script marca TODOS os emails como verificados.")
    print("   Use apenas para testes em desenvolvimento!\n")
    
    response = input("Deseja continuar? (s/n): ").strip().lower()
    
    if response in ['s', 'sim', 'y', 'yes']:
        verify_all_users_email()
    else:
        print("\n❌ Operação cancelada.")
        sys.exit(0)

