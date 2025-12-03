"""Script para criar um produtor (buyer) para testar a IA"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.database import SessionLocal
from app.models import User, UserRole, BuyerProfile
from app.repositories.user_repository import UserRepository
from app.repositories.buyer_profile_repository import BuyerProfileRepository


def create_producer_buyer():
    db = SessionLocal()
    try:
        user_repo = UserRepository(db)
        buyer_repo = BuyerProfileRepository(db)
        
        email = "produtor.teste@empresa.com"
        password = "Senha123!"
        
        # Verifica se já existe
        existing = user_repo.get_by_email(email)
        if existing:
            print(f"⚠️  Usuário {email} já existe")
            return existing
        
        # Cria usuário
        user = User(
            email=email,
            password_hash=get_password_hash(password),
            role=UserRole.BUYER,
            nickname="Produtor Teste",
            email_verificado=True
        )
        db.add(user)
        db.flush()
        
        # Cria buyer_profile (com CPF para evitar constraint unique)
        buyer_profile = BuyerProfile(
            user_id=user.id,
            nome_completo="João Produtor Silva",
            cpf="12345678901",  # CPF fictício único
            endereco="Fazenda São José, KM 10",
            bairro="Zona Rural",
            cep="77000000",
            cidade="Palmas",
            estado="TO",
        )
        db.add(buyer_profile)
        db.commit()
        db.refresh(user)
        db.refresh(buyer_profile)
        
        print(f"✅ Produtor criado com sucesso!")
        print(f"   Email: {user.email}")
        print(f"   Senha: {password}")
        print(f"   Nome: {buyer_profile.nome_completo}")
        print(f"   Cidade: {buyer_profile.cidade} / {buyer_profile.estado}")
        print(f"\n💡 Use este usuário para testar a IA!")
        print(f"   Ele vai ver cotações relevantes baseadas no perfil")
        
        return user
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    create_producer_buyer()

