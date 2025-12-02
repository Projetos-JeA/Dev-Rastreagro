"""Script para verificar perfis do usuário jeferson.greenish"""

import sys
from pathlib import Path

# Adiciona o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.database import SessionLocal
from app.repositories.user_repository import UserRepository
from app.repositories.buyer_profile_repository import BuyerProfileRepository
from app.repositories.company_repository import CompanyRepository
from app.repositories.service_provider_repository import ServiceProviderRepository

def check_user_profiles():
    db = SessionLocal()
    try:
        user_repo = UserRepository(db)
        buyer_repo = BuyerProfileRepository(db)
        company_repo = CompanyRepository(db)
        service_repo = ServiceProviderRepository(db)
        
        email = "jeferson.greenish@gmail.com"
        user = user_repo.get_by_email(email)
        
        if not user:
            print(f"❌ Usuário {email} não encontrado")
            return
        
        print(f"\n👤 Usuário: {user.email}")
        print(f"   ID: {user.id}")
        print(f"   Role principal: {user.role.value}")
        print(f"   Nickname: {user.nickname}")
        
        # Verifica perfis disponíveis
        print(f"\n📋 Perfis disponíveis:")
        
        buyer_profile = buyer_repo.get_by_user_id(user.id)
        if buyer_profile:
            print(f"   ✅ Buyer Profile (ID: {buyer_profile.id})")
            print(f"      Nome: {buyer_profile.nome_completo}")
        else:
            print(f"   ❌ Buyer Profile: NÃO encontrado")
        
        company = company_repo.get_by_user_id(user.id)
        if company:
            print(f"   ✅ Company (ID: {company.id})")
            print(f"      Nome: {company.nome_propriedade}")
        else:
            print(f"   ❌ Company: NÃO encontrado")
        
        service_profile = service_repo.get_by_user_id(user.id)
        if service_profile:
            print(f"   ✅ Service Provider (ID: {service_profile.id})")
            print(f"      Nome: {service_profile.nome_servico}")
        else:
            print(f"   ❌ Service Provider: NÃO encontrado")
        
        # Determina perfis disponíveis (igual ao backend)
        available_roles = []
        if buyer_profile:
            available_roles.append("buyer")
        if company:
            available_roles.append("seller")
        if service_profile:
            available_roles.append("service_provider")
        
        print(f"\n🎯 Perfis que DEVEM aparecer no frontend:")
        print(f"   roles = {available_roles}")
        print(f"   Quantidade: {len(available_roles)}")
        
        if len(available_roles) > 1:
            print(f"\n✅ Sistema DEVE mostrar tela de seleção!")
        else:
            print(f"\n⚠️  Sistema NÃO vai mostrar tela de seleção (apenas 1 perfil)")
        
    finally:
        db.close()

if __name__ == "__main__":
    check_user_profiles()

