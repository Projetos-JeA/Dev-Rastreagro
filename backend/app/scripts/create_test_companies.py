"""
Script para criar 2 empresas de teste compatíveis com o perfil do comprador
Uso: python -m app.scripts.create_test_companies
"""

import sys
from pathlib import Path
from datetime import date, datetime

# Adiciona o diretório raiz ao path
root_dir = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(root_dir))

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.database import SessionLocal
from app.models import User, UserRole, Company, CompanyActivity
from app.repositories.activity_repository import ActivityRepository
from app.repositories.user_repository import UserRepository
from app.repositories.company_repository import CompanyRepository


def get_user_activities(user_id: int, db: Session) -> list:
    """Busca atividades do usuário (comprador)"""
    # Verifica se tem buyer_profile e suas atividades
    # Por enquanto, vamos criar empresas genéricas compatíveis com pecuária e agricultura
    return []


def create_test_companies():
    """Cria 2 empresas de teste compatíveis"""
    db: Session = SessionLocal()
    try:
        activity_repo = ActivityRepository(db)
        user_repo = UserRepository(db)
        company_repo = CompanyRepository(db)

        # Busca categorias disponíveis
        categories = activity_repo.list_categories()
        if not categories:
            print("❌ Nenhuma categoria de atividade encontrada. Execute as migrations primeiro.")
            return

        # Busca o usuário atual (jeferson.greenish@gmail.com)
        user = user_repo.get_by_email("jeferson.greenish@gmail.com")
        if not user:
            print("❌ Usuário jeferson.greenish@gmail.com não encontrado.")
            return

        print(f"✅ Usuário encontrado: {user.email} (ID: {user.id})")

        # Busca categorias de agricultura e pecuária
        agri_category = next((c for c in categories if "agricultura" in c.name.lower() or "agricultura" in getattr(c, 'description', '').lower()), None)
        pecu_category = next((c for c in categories if "pecuária" in c.name.lower() or "pecuaria" in c.name.lower() or "pecuária" in getattr(c, 'description', '').lower()), None)

        if not agri_category or not pecu_category:
            # Usa as primeiras categorias disponíveis
            agri_category = categories[0] if len(categories) > 0 else None
            pecu_category = categories[1] if len(categories) > 1 else categories[0]

        print(f"📋 Categorias selecionadas:")
        print(f"   Agricultura: {agri_category.name if agri_category else 'N/A'}")
        print(f"   Pecuária: {pecu_category.name if pecu_category else 'N/A'}")

        # Busca grupos e itens
        agri_groups = activity_repo.list_groups(agri_category.id) if agri_category else []
        pecu_groups = activity_repo.list_groups(pecu_category.id) if pecu_category else []

        agri_group = agri_groups[0] if agri_groups else None
        pecu_group = pecu_groups[0] if pecu_groups else None

        agri_items = activity_repo.list_items(agri_group.id) if agri_group else []
        pecu_items = activity_repo.list_items(pecu_group.id) if pecu_group else []

        agri_item = agri_items[0] if agri_items else None
        pecu_item = pecu_items[0] if pecu_items else None

        # EMPRESA 1: Agropecuária Silva - Foco em Pecuária
        print("\n🏢 Criando Empresa 1: Agropecuária Silva...")
        user1 = User(
            email=f"agropecuaria.silva.{datetime.now().timestamp()}@test.com",
            password_hash=get_password_hash("Agro2020@"),
            role=UserRole.SELLER,
            nickname="Agropecuária Silva",
            email_verificado=True,
        )
        db.add(user1)
        db.flush()

        company1 = Company(
            user_id=user1.id,
            nome_propriedade="Agropecuária Silva",
            cnpj_cpf="12.345.678/0001-90",
            insc_est_identidade="123.456.789.012",
            endereco="Rodovia BR-153, Km 45",
            bairro="Zona Rural",
            cep="77000-000",
            cidade="Palmas",
            estado="TO",
            email=user1.email,
        )
        db.add(company1)
        db.flush()

        # Atividades da empresa 1 (Pecuária - Bovinos)
        if pecu_category and pecu_group and pecu_item:
            activity1 = CompanyActivity(
                company_id=company1.id,
                category_id=pecu_category.id,
                group_id=pecu_group.id,
                item_id=pecu_item.id,
            )
            db.add(activity1)

        # EMPRESA 2: Fazenda Verde - Foco em Agricultura
        print("🏢 Criando Empresa 2: Fazenda Verde...")
        user2 = User(
            email=f"fazenda.verde.{datetime.now().timestamp()}@test.com",
            password_hash=get_password_hash("Agro2020@"),
            role=UserRole.SELLER,
            nickname="Fazenda Verde",
            email_verificado=True,
        )
        db.add(user2)
        db.flush()

        company2 = Company(
            user_id=user2.id,
            nome_propriedade="Fazenda Verde",
            cnpj_cpf="98.765.432/0001-10",
            insc_est_identidade="987.654.321.098",
            endereco="Estrada Municipal, S/N",
            bairro="Fazenda São José",
            cep="78000-000",
            cidade="Cuiabá",
            estado="MT",
            email=user2.email,
        )
        db.add(company2)
        db.flush()

        # Atividades da empresa 2 (Agricultura - Soja/Milho)
        if agri_category and agri_group and agri_item:
            activity2 = CompanyActivity(
                company_id=company2.id,
                category_id=agri_category.id,
                group_id=agri_group.id,
                item_id=agri_item.id,
            )
            db.add(activity2)

        db.commit()

        print("\n✅ Empresas criadas com sucesso!")
        print(f"\n📋 Empresa 1:")
        print(f"   ID: {user1.id}")
        print(f"   Email: {user1.email}")
        print(f"   Nickname: {user1.nickname}")
        print(f"   CNPJ: {company1.cnpj_cpf}")
        print(f"   Localização: {company1.cidade}, {company1.estado}")

        print(f"\n📋 Empresa 2:")
        print(f"   ID: {user2.id}")
        print(f"   Email: {user2.email}")
        print(f"   Nickname: {user2.nickname}")
        print(f"   CNPJ: {company2.cnpj_cpf}")
        print(f"   Localização: {company2.cidade}, {company2.estado}")

        print("\n💡 Próximos passos:")
        print("   • Criar cotações para essas empresas")
        print("   • Testar matching com o comprador")

    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao criar empresas: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    create_test_companies()

