"""Script para verificar usuários com múltiplos perfis"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.database import SessionLocal
from app.models import User, BuyerProfile, Company, ServiceProvider

def check_multiple_profiles():
    db = SessionLocal()
    try:
        print("🔍 Verificando perfis dos usuários...\n")

        users = db.query(User).all()

        for user in users:
            buyer_profile = db.query(BuyerProfile).filter(BuyerProfile.user_id == user.id).first()
            company = db.query(Company).filter(Company.user_id == user.id).first()
            service_provider = db.query(ServiceProvider).filter(ServiceProvider.user_id == user.id).first()

            profiles = []
            if buyer_profile:
                profiles.append("BuyerProfile")
            if company:
                profiles.append("Company")
            if service_provider:
                profiles.append("ServiceProvider")

            profile_count = len(profiles)

            print(f"👤 {user.email}")
            print(f"   Role: {user.role.value}")
            print(f"   Nickname: {user.nickname}")
            print(f"   Perfis ({profile_count}): {', '.join(profiles) if profiles else 'Nenhum'}")

            if profile_count > 2:
                print(f"   ⚠️  TEM MAIS DE 2 PERFIS!")
            elif profile_count == 2:
                print(f"   ✅ Tem exatamente 2 perfis")
            elif profile_count == 1:
                print(f"   ℹ️  Tem 1 perfil")
            else:
                print(f"   ⚠️  Sem perfis!")

            print()

        print("\n📊 Resumo:")
        users_with_multiple = sum(1 for u in users if len([
            db.query(BuyerProfile).filter(BuyerProfile.user_id == u.id).first(),
            db.query(Company).filter(Company.user_id == u.id).first(),
            db.query(ServiceProvider).filter(ServiceProvider.user_id == u.id).first()
        ]) > 2)

        users_with_two = sum(1 for u in users if len([p for p in [
            db.query(BuyerProfile).filter(BuyerProfile.user_id == u.id).first(),
            db.query(Company).filter(Company.user_id == u.id).first(),
            db.query(ServiceProvider).filter(ServiceProvider.user_id == u.id).first()
        ] if p]) == 2)

        print(f"   Total de usuários: {len(users)}")
        print(f"   Com mais de 2 perfis: {users_with_multiple}")
        print(f"   Com exatamente 2 perfis: {users_with_two}")

    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_multiple_profiles()
