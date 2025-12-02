"""Script temporário para verificar dados no banco"""

import sys
from pathlib import Path

# Adiciona o diretório backend ao path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import User, Company, ServiceProvider, BuyerProfile

def check_database():
    db = SessionLocal()
    try:
        # Verifica usuários
        users = db.query(User).all()
        print(f"\n{'='*60}")
        print(f"TOTAL DE USUÁRIOS: {len(users)}")
        print(f"{'='*60}\n")
        
        for user in users:
            print(f"👤 USUÁRIO ID: {user.id}")
            print(f"   Email: {user.email}")
            print(f"   Role: {user.role}")
            print(f"   Email Verificado: {user.email_verificado}")
            print(f"   Nickname: {user.nickname or 'N/A'}")
            print(f"   Criado em: {user.created_at}")
            
            # Verifica perfil específico
            if user.role == "buyer":
                profile = db.query(BuyerProfile).filter(BuyerProfile.user_id == user.id).first()
                if profile:
                    print(f"   📋 PERFIL COMPRADOR:")
                    print(f"      Nome: {profile.nome_completo}")
                    print(f"      CPF: {profile.cpf or 'N/A'}")
                    print(f"      Cidade: {profile.cidade}")
                    print(f"      Estado: {profile.estado}")
            
            elif user.role == "seller":
                company = db.query(Company).filter(Company.user_id == user.id).first()
                if company:
                    print(f"   🏢 EMPRESA:")
                    print(f"      Nome: {company.nome_propriedade}")
                    print(f"      CNPJ/CPF: {company.cnpj_cpf}")
                    print(f"      Cidade: {company.cidade}")
                    print(f"      Estado: {company.estado}")
                    print(f"      Email: {company.email}")
            
            elif user.role == "service_provider":
                provider = db.query(ServiceProvider).filter(ServiceProvider.user_id == user.id).first()
                if provider:
                    print(f"   🔧 PRESTADOR:")
                    print(f"      Nome do Serviço: {provider.nome_servico}")
                    print(f"      Tipo: {provider.tipo_servico or 'N/A'}")
                    print(f"      CNPJ/CPF: {provider.cnpj_cpf or 'N/A'}")
                    print(f"      Cidade: {provider.cidade}")
                    print(f"      Estado: {provider.estado}")
            
            print(f"\n{'-'*60}\n")
        
        if len(users) == 0:
            print("⚠️  Nenhum usuário cadastrado ainda.\n")
            
    except Exception as e:
        print(f"❌ Erro ao consultar banco: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_database()

