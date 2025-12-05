"""
Script para verificar dados do usuário boi@gmail.com
Uso: python -m app.scripts.check_user_boi
"""

import sys
from pathlib import Path

# Adiciona o diretório raiz ao path
root_dir = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(root_dir))

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.company import Company, CompanyActivity
from app.models.buyer_profile import BuyerProfile
from app.models.service_provider import ServiceProvider


def check_user_boi():
    """Verifica dados do usuário boi@gmail.com"""
    db: Session = SessionLocal()
    try:
        # Busca o usuário
        user = db.query(User).filter(User.email == "boi@gmail.com").first()
        
        if not user:
            print("❌ Usuário boi@gmail.com não encontrado")
            return
        
        print(f"\n✅ Usuário encontrado:")
        print(f"   ID: {user.id}")
        print(f"   Email: {user.email}")
        print(f"   Role: {user.role}")
        print(f"   Nickname: {user.nickname}")
        print(f"   Email Verificado: {user.email_verificado}")
        
        # Verifica Company
        company = db.query(Company).filter(Company.user_id == user.id).first()
        if company:
            print(f"\n🏢 Dados da Empresa:")
            print(f"   ID: {company.id}")
            print(f"   Nome Propriedade: {company.nome_propriedade}")
            print(f"   CNPJ/CPF: {company.cnpj_cpf}")
            print(f"   Cidade: {company.cidade}")
            print(f"   Estado: {company.estado}")
            print(f"   Email: {company.email}")
            
            # Verifica atividades
            activities = db.query(CompanyActivity).filter(CompanyActivity.company_id == company.id).all()
            print(f"   Atividades: {len(activities)}")
            for act in activities:
                cat = act.category.name if act.category else "N/A"
                group = act.group.name if act.group else "N/A"
                item = act.item.name if act.item else "N/A"
                print(f"      - {cat} > {group} > {item}")
        else:
            print(f"\n❌ Nenhuma empresa encontrada para este usuário")
        
        # Verifica BuyerProfile
        buyer_profile = db.query(BuyerProfile).filter(BuyerProfile.user_id == user.id).first()
        if buyer_profile:
            print(f"\n👤 Dados do Comprador:")
            print(f"   ID: {buyer_profile.id}")
            print(f"   CPF: {buyer_profile.cpf}")
            print(f"   Cidade: {buyer_profile.cidade}")
            print(f"   Estado: {buyer_profile.estado}")
        else:
            print(f"\n❌ Nenhum perfil de comprador encontrado")
        
        # Verifica ServiceProvider
        service_provider = db.query(ServiceProvider).filter(ServiceProvider.user_id == user.id).first()
        if service_provider:
            print(f"\n🔧 Dados do Prestador:")
            print(f"   ID: {service_provider.id}")
            print(f"   Nome Serviço: {service_provider.nome_servico}")
            print(f"   CNPJ/CPF: {service_provider.cnpj_cpf}")
            print(f"   Cidade: {service_provider.cidade}")
            print(f"   Estado: {service_provider.estado}")
            print(f"   Email Contato: {service_provider.email_contato}")
        else:
            print(f"\n❌ Nenhum prestador de serviço encontrado")
        
        # Resumo
        print(f"\n📊 Resumo:")
        print(f"   Role: {user.role.value}")
        print(f"   Tem Company: {'Sim' if company else 'Não'}")
        print(f"   Tem BuyerProfile: {'Sim' if buyer_profile else 'Não'}")
        print(f"   Tem ServiceProvider: {'Sim' if service_provider else 'Não'}")
        
        # Verifica se deveria ter dados
        if user.role == UserRole.SELLER and not company:
            print(f"\n⚠️  PROBLEMA: Usuário é SELLER mas não tem Company!")
        if user.role == UserRole.BUYER and not buyer_profile:
            print(f"\n⚠️  PROBLEMA: Usuário é BUYER mas não tem BuyerProfile!")
        if user.role == UserRole.SERVICE_PROVIDER and not service_provider:
            print(f"\n⚠️  PROBLEMA: Usuário é SERVICE_PROVIDER mas não tem ServiceProvider!")
        
    except Exception as e:
        print(f"❌ Erro ao verificar usuário: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    check_user_boi()

