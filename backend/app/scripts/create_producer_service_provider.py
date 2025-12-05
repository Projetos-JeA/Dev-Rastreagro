"""
Script para criar 3 perfis de Produtor + Prestador de Serviço
Uso: python -m app.scripts.create_producer_service_provider
"""

import sys
from pathlib import Path
from datetime import datetime
import random

# Adiciona o diretório raiz ao path
root_dir = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(root_dir))

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.company import Company
from app.models.buyer_profile import BuyerProfile
from app.models.service_provider import ServiceProvider
from app.models.company import CompanyActivity
from app.repositories.user_repository import UserRepository
from app.repositories.company_repository import CompanyRepository
from app.repositories.buyer_profile_repository import BuyerProfileRepository
from app.repositories.service_provider_repository import ServiceProviderRepository
from app.repositories.activity_repository import ActivityRepository
from app.core.security import get_password_hash

# Dados de exemplo
ESTADOS = ['SP', 'MG', 'RS', 'PR', 'SC', 'GO', 'MT', 'MS', 'BA', 'TO']
CIDADES = {
    'SP': ['Campinas', 'Ribeirão Preto', 'Piracicaba', 'Sorocaba', 'Bauru'],
    'MG': ['Uberlândia', 'Juiz de Fora', 'Belo Horizonte', 'Lavras', 'Viçosa'],
    'RS': ['Porto Alegre', 'Pelotas', 'Santa Maria', 'Caxias do Sul', 'Passo Fundo'],
    'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel'],
    'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'Chapecó', 'Lages'],
    'GO': ['Goiânia', 'Rio Verde', 'Jataí', 'Catalão', 'Anápolis'],
    'MT': ['Cuiabá', 'Rondonópolis', 'Sinop', 'Tangará da Serra', 'Barra do Garças'],
    'MS': ['Campo Grande', 'Dourados', 'Três Lagoas', 'Ponta Porã', 'Naviraí'],
    'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Juazeiro', 'Barreiras'],
    'TO': ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso'],
}

# CPFs válidos para teste
CPFS_TESTE = [
    "11111111111",
    "22222222222",
    "33333333333",
]

# CNPJs válidos para teste
CNPJS_TESTE = [
    "11111111000111",
    "22222222000122",
    "33333333000133",
]


def criar_usuario(
    db: Session,
    email: str,
    nickname: str,
    role: UserRole,
    cpf: str = None,
    cnpj: str = None,
    nome_completo: str = None,
    nome_propriedade: str = None,
    nome_servico: str = None,
    criar_buyer: bool = False,
    criar_company: bool = False,
    criar_service: bool = False,
):
    """Cria um usuário com os perfis especificados"""
    user_repo = UserRepository(db)
    buyer_repo = BuyerProfileRepository(db)
    company_repo = CompanyRepository(db)
    service_repo = ServiceProviderRepository(db)
    activity_repo = ActivityRepository(db)

    # Verifica se já existe
    existing = user_repo.get_by_email(email)
    if existing:
        print(f"   ⚠️ Usuário {email} já existe, pulando...")
        return existing

    # Cria usuário
    password_hash = get_password_hash("Senha123!")
    user = User(
        email=email,
        password_hash=password_hash,
        role=role,
        nickname=nickname,
        email_verificado=True,
    )
    db.add(user)
    db.flush()

    estado = random.choice(ESTADOS)
    cidade = random.choice(CIDADES[estado])
    cep = f"{random.randint(10000, 99999)}-{random.randint(100, 999)}"
    endereco = f"Rua {random.randint(1, 999)}, {random.randint(100, 999)}"

    # Cria BuyerProfile se necessário
    if criar_buyer:
        if not cpf:
            cpf = CPFS_TESTE.pop(0) if CPFS_TESTE else f"{random.randint(10000000000, 99999999999):011d}"

        buyer = BuyerProfile(
            user_id=user.id,
            nome_completo=nome_completo or f"{nickname} Completo",
            cpf=cpf,
            endereco=endereco,
            cep=cep,
            cidade=cidade,
            estado=estado,
        )
        db.add(buyer)
        print(f"   ✅ BuyerProfile criado (CPF: {cpf})")

    # Cria Company se necessário
    if criar_company:
        if not cnpj:
            cnpj = CNPJS_TESTE.pop(0) if CNPJS_TESTE else f"{random.randint(10000000000000, 99999999999999):014d}"

        company = Company(
            user_id=user.id,
            nome_propriedade=nome_propriedade or f"Propriedade {nickname}",
            cnpj_cpf=cnpj,
            endereco=endereco,
            cep=cep,
            cidade=cidade,
            estado=estado,
            email=email,
        )
        db.add(company)
        db.flush()

        # Adiciona atividades (categoria Agricultura)
        categories = activity_repo.list_categories()
        if categories:
            agri_cat = next(
                (c for c in categories if "agricultura" in c.name.lower() or "agriculture" in c.name.lower()),
                categories[0],
            )
            activity = CompanyActivity(
                company_id=company.id,
                category_id=agri_cat.id,
            )
            db.add(activity)

        print(f"   ✅ Company criada (CNPJ: {cnpj})")

    # Cria ServiceProvider se necessário
    if criar_service:
        service = ServiceProvider(
            user_id=user.id,
            nome_servico=nome_servico or f"Serviço {nickname}",
            email_contato=email,
            cidade=cidade,
            estado=estado,
            endereco=endereco,
            cep=cep,
        )
        db.add(service)
        print(f"   ✅ ServiceProvider criado")

    db.commit()
    return user


def main():
    db = SessionLocal()

    try:
        print("👥 Criando 3 perfis de Produtor + Prestador de Serviço...\n")

        # 1. PRODUTOR + PRESTADOR 1
        print("1️⃣ PRODUTOR + PRESTADOR 1:")
        user1 = criar_usuario(
            db=db,
            email="produtor_prestador1@teste.com",
            nickname="Produtor Prestador 1",
            role=UserRole.BUYER,
            criar_buyer=True,
            criar_service=True,
        )
        print(f"   ✅ produtor_prestador1@teste.com criado\n")

        # 2. PRODUTOR + PRESTADOR 2
        print("2️⃣ PRODUTOR + PRESTADOR 2:")
        user2 = criar_usuario(
            db=db,
            email="produtor_prestador2@teste.com",
            nickname="Produtor Prestador 2",
            role=UserRole.BUYER,
            criar_buyer=True,
            criar_service=True,
        )
        print(f"   ✅ produtor_prestador2@teste.com criado\n")

        # 3. PRODUTOR + PRESTADOR 3
        print("3️⃣ PRODUTOR + PRESTADOR 3:")
        user3 = criar_usuario(
            db=db,
            email="produtor_prestador3@teste.com",
            nickname="Produtor Prestador 3",
            role=UserRole.BUYER,
            criar_buyer=True,
            criar_service=True,
        )
        print(f"   ✅ produtor_prestador3@teste.com criado\n")

        print("=" * 60)
        print("✅ CRIAÇÃO COMPLETA!")
        print("=" * 60)
        print(f"👥 Usuários criados: 3")
        print()
        print("🔑 Senha padrão para todos: Senha123!")
        print("✅ Todos os emails estão verificados")
        print()
        print("📊 Perfis criados:")
        print("   • produtor_prestador1@teste.com - Produtor + Prestador")
        print("   • produtor_prestador2@teste.com - Produtor + Prestador")
        print("   • produtor_prestador3@teste.com - Produtor + Prestador")
        print()
        print("💡 Esses usuários podem:")
        print("   • Criar cotações (como produtor)")
        print("   • Criar ofertas (como produtor)")
        print("   • Oferecer serviços (como prestador)")
        print("   • Alternar entre os perfis no app")
        print()

    except Exception as e:
        db.rollback()
        print(f"❌ Erro: {e}")
        import traceback

        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    main()

