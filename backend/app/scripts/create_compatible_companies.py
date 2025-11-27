"""
Script para criar 2 empresas compatíveis com o perfil do comprador jeferson
Uso: python -m app.scripts.create_compatible_companies
"""

import sys
from pathlib import Path

# Adiciona o diretório raiz ao path
root_dir = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(root_dir))

from sqlalchemy.orm import Session
from datetime import datetime

from app.database import SessionLocal
from app.models import User, UserRole, Company, CompanyActivity
from app.repositories.user_repository import UserRepository
from app.repositories.company_repository import CompanyRepository
from app.repositories.activity_repository import ActivityRepository
from app.core.security import get_password_hash


def create_compatible_companies():
    """Cria 2 empresas compatíveis com o perfil do comprador jeferson"""
    db: Session = SessionLocal()
    try:
        # Busca o usuário jeferson
        user_repo = UserRepository(db)
        jeferson = user_repo.get_by_email("jeferson.greenish@gmail.com")

        if not jeferson:
            print("❌ Usuário jeferson.greenish@gmail.com não encontrado.")
            return False

        # Busca o buyer_profile do jeferson para ver suas atividades
        from app.repositories.buyer_profile_repository import BuyerProfileRepository
        buyer_repo = BuyerProfileRepository(db)
        buyer_profile = buyer_repo.get_by_user_id(jeferson.id)

        if not buyer_profile:
            print("❌ Perfil de comprador não encontrado para jeferson.")
            return False

        print(f"✅ Usuário encontrado: {jeferson.nickname} (ID: {jeferson.id})")
        print(f"   Localização: {buyer_profile.cidade}, {buyer_profile.estado}")

        # Busca atividades disponíveis
        activity_repo = ActivityRepository(db)
        categories = activity_repo.list_categories()

        # Cria primeira empresa: "Agropecuária Costa" (compatível com bovinos)
        print("\n📦 Criando empresa 1: Agropecuária Costa...")
        company1_user = User(
            email=f"agropecuaria.costa.{datetime.now().timestamp()}@test.com",
            password_hash=get_password_hash("Agro2020@"),
            role=UserRole.SELLER,
            nickname="Agropecuária Costa",
            email_verificado=True,
        )
        db.add(company1_user)
        db.flush()

        company1 = Company(
            user_id=company1_user.id,
            cnpj_cpf="12.345.678/0001-90",
            razao_social="Agropecuária Costa Ltda",
            nome_fantasia="Agropecuária Costa",
            insc_est_identidade="123.456.789.012",
            endereco="Rua das Fazendas, 100",
            bairro="Centro",
            cep="38000-000",
            cidade="Uberaba",
            estado="MG",
            telefone="(34) 99999-9999",
        )
        db.add(company1)
        db.flush()

        # Adiciona atividades relacionadas a bovinos (compatível com jeferson)
        # Assumindo que há categorias de pecuária
        livestock_category = next((c for c in categories if "pecuária" in c.nome.lower() or "bovino" in c.nome.lower()), None)
        if livestock_category:
            groups = activity_repo.list_groups(livestock_category.id)
            if groups:
                items = activity_repo.list_items(groups[0].id)
                if items:
                    company1_activity = CompanyActivity(
                        company_id=company1.id,
                        category_id=livestock_category.id,
                        group_id=groups[0].id,
                        item_id=items[0].id,
                    )
                    db.add(company1_activity)

        db.commit()
        print(f"   ✅ Empresa criada: {company1.nome_fantasia} (ID: {company1.id})")
        print(f"   Email: {company1_user.email}")

        # Cria segunda empresa: "Fazenda Silva" (compatível com agricultura)
        print("\n📦 Criando empresa 2: Fazenda Silva...")
        company2_user = User(
            email=f"fazenda.silva.{datetime.now().timestamp()}@test.com",
            password_hash=get_password_hash("Agro2020@"),
            role=UserRole.SELLER,
            nickname="Fazenda Silva",
            email_verificado=True,
        )
        db.add(company2_user)
        db.flush()

        company2 = Company(
            user_id=company2_user.id,
            cnpj_cpf="98.765.432/0001-10",
            razao_social="Fazenda Silva Ltda",
            nome_fantasia="Fazenda Silva",
            insc_est_identidade="987.654.321.098",
            endereco="Rodovia BR-050, Km 100",
            bairro="Zona Rural",
            cep="14000-000",
            cidade="Ribeirão Preto",
            estado="SP",
            telefone="(16) 88888-8888",
        )
        db.add(company2)
        db.flush()

        # Adiciona atividades relacionadas a agricultura (compatível com jeferson)
        agriculture_category = next((c for c in categories if "agricultura" in c.nome.lower() or "soja" in c.nome.lower()), None)
        if agriculture_category:
            groups = activity_repo.list_groups(agriculture_category.id)
            if groups:
                items = activity_repo.list_items(groups[0].id)
                if items:
                    company2_activity = CompanyActivity(
                        company_id=company2.id,
                        category_id=agriculture_category.id,
                        group_id=groups[0].id,
                        item_id=items[0].id,
                    )
                    db.add(company2_activity)

        db.commit()
        print(f"   ✅ Empresa criada: {company2.nome_fantasia} (ID: {company2.id})")
        print(f"   Email: {company2_user.email}")

        print("\n✅ Empresas compatíveis criadas com sucesso!")
        print("\n📋 Credenciais:")
        print(f"   Empresa 1: {company1_user.email} / Agro2020@")
        print(f"   Empresa 2: {company2_user.email} / Agro2020@")
        return True

    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao criar empresas: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    create_compatible_companies()

