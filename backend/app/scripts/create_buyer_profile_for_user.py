"""Script para criar buyer_profile para um usuário que já tem company"""

import sys
from pathlib import Path

# Adiciona o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.database import SessionLocal
from app.repositories.user_repository import UserRepository
from app.repositories.buyer_profile_repository import BuyerProfileRepository
from app.repositories.company_repository import CompanyRepository
from app.models.buyer_profile import BuyerProfile

def create_buyer_profile(email: str):
    db = SessionLocal()
    try:
        user_repo = UserRepository(db)
        buyer_repo = BuyerProfileRepository(db)
        company_repo = CompanyRepository(db)
        
        # Busca usuário
        user = user_repo.get_by_email(email)
        if not user:
            print(f"❌ Usuário {email} não encontrado")
            return
        
        print(f"\n👤 Usuário: {user.email} (ID: {user.id})")
        
        # Verifica se já tem buyer_profile
        existing_buyer = buyer_repo.get_by_user_id(user.id)
        if existing_buyer:
            print(f"✅ Usuário já tem buyer_profile (ID: {existing_buyer.id})")
            print(f"   Nome: {existing_buyer.nome_completo}")
            return
        
        # Verifica se tem company (para pegar dados de endereço)
        company = company_repo.get_by_user_id(user.id)
        
        # Cria buyer_profile com dados básicos
        buyer_profile = BuyerProfile(
            user_id=user.id,
            nome_completo=user.nickname or user.email.split('@')[0],
            endereco=company.endereco if company else "",
            bairro=company.bairro if company else "",
            cep=company.cep if company else "",
            cidade=company.cidade if company else "",
            estado=company.estado if company else "",
        )
        
        db.add(buyer_profile)
        db.commit()
        db.refresh(buyer_profile)
        
        print(f"\n✅ Buyer Profile criado com sucesso!")
        print(f"   ID: {buyer_profile.id}")
        print(f"   Nome: {buyer_profile.nome_completo}")
        print(f"   Cidade: {buyer_profile.cidade}")
        print(f"   Estado: {buyer_profile.estado}")
        
        # Verifica perfis disponíveis agora
        available_roles = []
        if buyer_profile:
            available_roles.append("buyer")
        if company:
            available_roles.append("seller")
        
        print(f"\n🎯 Perfis disponíveis agora: {available_roles}")
        print(f"   Quantidade: {len(available_roles)}")
        
        if len(available_roles) > 1:
            print(f"\n✅ Sistema agora vai mostrar tela de seleção!")
        else:
            print(f"\n⚠️  Ainda tem apenas 1 perfil")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Erro ao criar buyer_profile: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else "jeferson.greenish@gmail.com"
    create_buyer_profile(email)

