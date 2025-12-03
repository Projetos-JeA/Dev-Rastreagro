"""Script para criar empresas usando busca de CNPJ e criar perfis completos"""

import sys
import asyncio
from pathlib import Path
from datetime import date, datetime

# Adiciona o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.database import SessionLocal
from app.models import (
    User, UserRole, Company, CompanyActivity, BuyerProfile, ServiceProvider, Quotation, QuotationCategory, QuotationStatus
)
from app.repositories.activity_repository import ActivityRepository
from app.repositories.user_repository import UserRepository
from app.repositories.company_repository import CompanyRepository
from app.repositories.buyer_profile_repository import BuyerProfileRepository
from app.repositories.service_provider_repository import ServiceProviderRepository
from app.repositories.quotation_repository import QuotationRepository
from app.services.brasilapi_service import BrasilAPIService


def clean_cnpj(cnpj: str) -> str:
    """Remove formatação do CNPJ"""
    return "".join(filter(str.isdigit, cnpj))


async def get_cnpj_data(cnpj: str):
    """Busca dados do CNPJ na BrasilAPI"""
    clean = clean_cnpj(cnpj)
    try:
        dados = await BrasilAPIService.consultar_cnpj(clean)
        if dados is None:
            print(f"⚠️  CNPJ {cnpj} não encontrado na Receita Federal")
            return None
        return dados
    except Exception as e:
        print(f"❌ Erro ao buscar CNPJ {cnpj}: {e}")
        return None


def create_user_and_company(db: Session, cnpj_data: dict, email: str, password: str, role: UserRole, nickname: str = None):
    """Cria usuário e empresa a partir dos dados do CNPJ"""
    user_repo = UserRepository(db)
    company_repo = CompanyRepository(db)
    activity_repo = ActivityRepository(db)
    
    # Verifica se email já existe
    existing_user = user_repo.get_by_email(email)
    if existing_user:
        print(f"⚠️  Email {email} já existe. Pulando...")
        return existing_user
    
    # Cria usuário
    user = User(
        email=email,
        password_hash=get_password_hash(password),
        role=role,
        nickname=nickname or email.split("@")[0],
        email_verificado=True  # Marca como verificado para facilitar testes
    )
    db.add(user)
    db.flush()
    
    # Monta endereço
    endereco_completo = cnpj_data.get("logradouro", "")
    numero = cnpj_data.get("numero", "")
    complemento = cnpj_data.get("complemento", "")
    
    endereco = endereco_completo
    if numero:
        endereco += f", {numero}"
    if complemento:
        endereco += f" - {complemento}"
    
    # Busca inscrição estadual
    inscricao_estadual = ""
    if "inscricao_estadual" in cnpj_data:
        inscricao_estadual = cnpj_data.get("inscricao_estadual", "") or ""
    elif "estabelecimento" in cnpj_data:
        estabelecimento = cnpj_data.get("estabelecimento", {})
        if isinstance(estabelecimento, dict):
            inscricao_estadual = estabelecimento.get("inscricao_estadual", "") or ""
    
    # Cria empresa
    company = Company(
        user_id=user.id,
        nome_propriedade=cnpj_data.get("nome_fantasia") or cnpj_data.get("razao_social", ""),
        cnpj_cpf=clean_cnpj(cnpj_data.get("cnpj", "")),
        insc_est_identidade=inscricao_estadual,
        endereco=endereco.strip() or "Endereço não informado",
        bairro=cnpj_data.get("bairro", ""),
        cep=cnpj_data.get("cep", "").replace("-", "") if cnpj_data.get("cep") else "",
        cidade=cnpj_data.get("municipio", ""),
        estado=cnpj_data.get("uf", ""),
        email=cnpj_data.get("email") or email,
    )
    db.add(company)
    db.flush()
    
    # Adiciona atividades (agricultura e pecuária)
    categories = activity_repo.list_categories()
    agri_category = next((c for c in categories if "agricultura" in c.name.lower()), None)
    pecu_category = next((c for c in categories if "pecuária" in c.name.lower() or "pecuaria" in c.name.lower()), None)
    
    if agri_category:
        agri_groups = activity_repo.list_groups(agri_category.id)
        if agri_groups:
            agri_group = agri_groups[0]
            activity = CompanyActivity(
                company_id=company.id,
                category_id=agri_category.id,
                group_id=agri_group.id
            )
            db.add(activity)
    
    if pecu_category:
        pecu_groups = activity_repo.list_groups(pecu_category.id)
        if pecu_groups:
            pecu_group = pecu_groups[0]
            activity = CompanyActivity(
                company_id=company.id,
                category_id=pecu_category.id,
                group_id=pecu_group.id
            )
            db.add(activity)
    
    db.commit()
    db.refresh(user)
    db.refresh(company)
    
    print(f"✅ Usuário e empresa criados:")
    print(f"   Email: {user.email}")
    print(f"   Empresa: {company.nome_propriedade}")
    print(f"   CNPJ: {company.cnpj_cpf}")
    
    return user


def create_buyer_profile(db: Session, user: User, company: Company):
    """Cria buyer_profile para um usuário que já tem company"""
    buyer_repo = BuyerProfileRepository(db)
    
    # Verifica se já tem
    existing = buyer_repo.get_by_user_id(user.id)
    if existing:
        print(f"⚠️  Usuário {user.email} já tem buyer_profile")
        return existing
    
    buyer_profile = BuyerProfile(
        user_id=user.id,
        nome_completo=user.nickname or user.email.split("@")[0],
        endereco=company.endereco,
        bairro=company.bairro,
        cep=company.cep,
        cidade=company.cidade,
        estado=company.estado,
    )
    db.add(buyer_profile)
    db.commit()
    db.refresh(buyer_profile)
    
    print(f"✅ Buyer Profile criado para {user.email}")
    return buyer_profile


def create_service_provider(db: Session, email: str, password: str, nome_servico: str, cidade: str, estado: str):
    """Cria prestador de serviço"""
    user_repo = UserRepository(db)
    service_repo = ServiceProviderRepository(db)
    
    # Verifica se email já existe
    existing_user = user_repo.get_by_email(email)
    if existing_user:
        print(f"⚠️  Email {email} já existe. Pulando...")
        return existing_user
    
    # Cria usuário
    user = User(
        email=email,
        password_hash=get_password_hash(password),
        role=UserRole.SERVICE_PROVIDER,
        nickname=email.split("@")[0],
        email_verificado=True
    )
    db.add(user)
    db.flush()
    
    # Cria prestador
    service = ServiceProvider(
        user_id=user.id,
        nome_servico=nome_servico,
        descricao=f"Serviços de {nome_servico}",
        telefone="(63) 99999-9999",
        email_contato=email,  # Campo obrigatório
        tipo_servico="AGRICULTURA",
        cidade=cidade,
        estado=estado,
        endereco=f"Rua Principal, 100",
        bairro="Centro",
        cep="77000000",
        cnpj_cpf="12345678901",  # CPF fictício
    )
    db.add(service)
    db.commit()
    db.refresh(user)
    db.refresh(service)
    
    print(f"✅ Prestador de serviço criado:")
    print(f"   Email: {user.email}")
    print(f"   Serviço: {service.nome_servico}")
    
    return user


def create_quotations(db: Session, seller_user: User, buyer_user: User = None):
    """Cria cotações relevantes para o comprador"""
    quotation_repo = QuotationRepository(db)
    company_repo = CompanyRepository(db)
    
    company = company_repo.get_by_user_id(seller_user.id)
    if not company:
        print(f"⚠️  Empresa não encontrada para {seller_user.email}")
        return
    
    # Cotações relevantes para pecuária e agricultura
    quotations_data = [
        {
            "title": "Ração para Gado de Corte Premium",
            "description": "Ração completa para engorda de gado de corte, 25kg",
            "category": QuotationCategory.LIVESTOCK,
            "product_type": "Ração",
            "price": 89.90,
            "quantity": 100,
            "unit": "saco",
            "location_city": company.cidade,
            "location_state": company.estado,
        },
        {
            "title": "Sal Mineral para Bovinos",
            "description": "Sal mineral completo para bovinos, 30kg",
            "category": QuotationCategory.LIVESTOCK,
            "product_type": "Sal Mineral",
            "price": 45.00,
            "quantity": 50,
            "unit": "saco",
            "location_city": company.cidade,
            "location_state": company.estado,
        },
        {
            "title": "Sementes de Pastagem Brachiaria",
            "description": "Sementes de pastagem Brachiaria BRS Piatã, 20kg",
            "category": QuotationCategory.AGRICULTURE,
            "product_type": "Sementes",
            "price": 120.00,
            "quantity": 30,
            "unit": "saco",
            "location_city": company.cidade,
            "location_state": company.estado,
        },
        {
            "title": "Defensivo Agrícola - Herbicida",
            "description": "Herbicida para controle de plantas daninhas, 5L",
            "category": QuotationCategory.AGRICULTURE,
            "product_type": "Defensivo",
            "price": 180.00,
            "quantity": 20,
            "unit": "litro",
            "location_city": company.cidade,
            "location_state": company.estado,
        },
        {
            "title": "Arame Farpado para Cerca",
            "description": "Arame farpado 12x12, rolo 500m",
            "category": QuotationCategory.BOTH,
            "product_type": "Arame",
            "price": 250.00,
            "quantity": 15,
            "unit": "rolo",
            "location_city": company.cidade,
            "location_state": company.estado,
        },
    ]
    
    created = []
    for qty_data in quotations_data:
        quotation = Quotation(
            seller_id=seller_user.id,
            seller_type="company",
            title=qty_data["title"],
            description=qty_data["description"],
            category=qty_data["category"],
            product_type=qty_data["product_type"],
            price=qty_data["price"],
            quantity=qty_data["quantity"],
            unit=qty_data["unit"],
            location_city=qty_data["location_city"],
            location_state=qty_data["location_state"],
            status=QuotationStatus.ACTIVE,
        )
        db.add(quotation)
        created.append(quotation)
    
    db.commit()
    
    print(f"✅ {len(created)} cotações criadas para {company.nome_propriedade}")
    return created


async def main():
    db = SessionLocal()
    try:
        print("🚀 Iniciando cadastro de empresas com CNPJ...\n")
        
        # CNPJs fornecidos
        empresas = [
            {
                "cnpj": "46887833000117",
                "razao_social": "D DE F PRESTES GONCALVES EXCELENTE QUALIFICACAO PROFISSIONAL",
                "email": "prestes.goncalves@empresa.com",
                "password": "Senha123!",
                "nickname": "Prestes Gonçalves",
                "is_dual_profile": False,  # Apenas fornecedor
            },
            {
                "cnpj": "15727764000150",
                "razao_social": "GRANDTEC MAQUINAS AGRICOLAS LTDA",
                "email": "grandtec@empresa.com",
                "password": "Senha123!",
                "nickname": "Grandtec",
                "is_dual_profile": True,  # Produtor + Fornecedor
            },
            {
                "cnpj": "25531012000173",
                "razao_social": "MARCELO THEODORO DOS SANTOS ME",
                "email": "marcelo.theodoro@empresa.com",
                "password": "Senha123!",
                "nickname": "Marcelo Theodoro",
                "is_dual_profile": False,  # Apenas fornecedor
            },
        ]
        
        created_users = []
        
        # Cria empresas
        for empresa in empresas:
            print(f"\n📋 Processando: {empresa['razao_social']}")
            print(f"   CNPJ: {empresa['cnpj']}")
            
            # Busca dados do CNPJ
            cnpj_data = await get_cnpj_data(empresa['cnpj'])
            if not cnpj_data:
                print(f"❌ Não foi possível buscar dados do CNPJ {empresa['cnpj']}")
                continue
            
            # Cria usuário e empresa
            user = create_user_and_company(
                db, cnpj_data, empresa['email'], empresa['password'], 
                UserRole.SELLER, empresa['nickname']
            )
            created_users.append((user, empresa['is_dual_profile']))
            
            # Se for perfil duplo, cria buyer_profile
            if empresa['is_dual_profile']:
                company = CompanyRepository(db).get_by_user_id(user.id)
                if company:
                    create_buyer_profile(db, user, company)
        
        # Cria prestador de serviço
        print(f"\n📋 Criando prestador de serviço...")
        service_user = create_service_provider(
            db, 
            "servicos.agricolas@empresa.com",
            "Senha123!",
            "Pulverização Agrícola",
            "Palmas",
            "TO"
        )
        created_users.append((service_user, False))
        
        # Cria cotações para cada empresa
        print(f"\n📦 Criando cotações...")
        buyer_user = None
        for user, is_dual in created_users:
            if is_dual:
                buyer_user = user  # Usa o usuário com perfil duplo como comprador
            create_quotations(db, user, buyer_user)
        
        print(f"\n✅ Cadastro concluído!")
        print(f"\n📊 Resumo:")
        print(f"   • {len(created_users)} usuários criados")
        print(f"   • 1 usuário com perfil duplo (produtor + fornecedor)")
        print(f"   • 1 prestador de serviço")
        print(f"   • Cotações criadas para cada empresa")
        print(f"\n💡 Credenciais:")
        for user, _ in created_users:
            print(f"   • {user.email} / Senha123!")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Erro: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(main())

