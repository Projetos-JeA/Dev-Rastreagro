"""Script para criar mais 10 empresas com CNPJs válidos"""

import sys
import asyncio
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.database import SessionLocal
from app.models import User, UserRole, Company, CompanyActivity, Quotation, QuotationCategory, QuotationStatus
from app.repositories.activity_repository import ActivityRepository
from app.repositories.user_repository import UserRepository
from app.repositories.company_repository import CompanyRepository
from app.repositories.quotation_repository import QuotationRepository
from app.services.brasilapi_service import BrasilAPIService


def clean_cnpj(cnpj: str) -> str:
    return "".join(filter(str.isdigit, cnpj))


async def get_cnpj_data(cnpj: str):
    clean = clean_cnpj(cnpj)
    try:
        dados = await BrasilAPIService.consultar_cnpj(clean)
        return dados
    except Exception as e:
        print(f"⚠️  Erro ao buscar CNPJ {cnpj}: {e}")
        return None


def create_company_with_quotations(db: Session, cnpj_data: dict, email: str, password: str, nickname: str, quotation_titles: list):
    """Cria empresa e cotações"""
    user_repo = UserRepository(db)
    company_repo = CompanyRepository(db)
    activity_repo = ActivityRepository(db)
    quotation_repo = QuotationRepository(db)
    
    # Verifica se já existe
    existing = user_repo.get_by_email(email)
    if existing:
        print(f"⚠️  {email} já existe, pulando...")
        return existing
    
    # Cria usuário
    user = User(
        email=email,
        password_hash=get_password_hash(password),
        role=UserRole.SELLER,
        nickname=nickname,
        email_verificado=True
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
            activity = CompanyActivity(
                company_id=company.id,
                category_id=agri_category.id,
                group_id=agri_groups[0].id
            )
            db.add(activity)
    
    if pecu_category:
        pecu_groups = activity_repo.list_groups(pecu_category.id)
        if pecu_groups:
            activity = CompanyActivity(
                company_id=company.id,
                category_id=pecu_category.id,
                group_id=pecu_groups[0].id
            )
            db.add(activity)
    
    # Cria cotações
    for title_data in quotation_titles:
        quotation = Quotation(
            seller_id=user.id,
            seller_type="company",
            title=title_data["title"],
            description=title_data.get("description", ""),
            category=title_data["category"],
            product_type=title_data.get("product_type", ""),
            price=title_data.get("price"),
            quantity=title_data.get("quantity"),
            unit=title_data.get("unit"),
            location_city=company.cidade,
            location_state=company.estado,
            status=QuotationStatus.ACTIVE,
        )
        db.add(quotation)
    
    db.commit()
    db.refresh(user)
    db.refresh(company)
    
    print(f"✅ {nickname}: {len(quotation_titles)} cotações")
    return user


async def main():
    db = SessionLocal()
    try:
        print("🚀 Criando mais 10 empresas...\n")
        
        # Lista de CNPJs válidos para criar empresas
        # Vou usar CNPJs genéricos ou buscar alguns reais
        empresas_data = [
            {
                "cnpj": "11222333000181",  # CNPJ genérico para teste
                "email": "agropecuaria.silva@empresa.com",
                "nickname": "Agropecuária Silva",
                "quotations": [
                    {"title": "Ração para Gado Premium 25kg", "category": QuotationCategory.LIVESTOCK, "product_type": "Ração", "price": 95.00, "quantity": 80, "unit": "saco"},
                    {"title": "Sal Mineral Completo 30kg", "category": QuotationCategory.LIVESTOCK, "product_type": "Sal Mineral", "price": 48.00, "quantity": 60, "unit": "saco"},
                    {"title": "Sementes de Milho Híbrido", "category": QuotationCategory.AGRICULTURE, "product_type": "Sementes", "price": 350.00, "quantity": 25, "unit": "saco"},
                ]
            },
            {
                "cnpj": "22333444000192",
                "email": "fazenda.sao.jose@empresa.com",
                "nickname": "Fazenda São José",
                "quotations": [
                    {"title": "Boi Nelore para Engorda", "category": QuotationCategory.LIVESTOCK, "product_type": "Gado", "price": 2500.00, "quantity": 10, "unit": "cabeça"},
                    {"title": "Defensivo Agrícola - Fungicida", "category": QuotationCategory.AGRICULTURE, "product_type": "Defensivo", "price": 220.00, "quantity": 15, "unit": "litro"},
                    {"title": "Arame Liso para Cerca", "category": QuotationCategory.BOTH, "product_type": "Arame", "price": 180.00, "quantity": 20, "unit": "rolo"},
                ]
            },
            {
                "cnpj": "33444555000103",
                "email": "agro.fertilizantes@empresa.com",
                "nickname": "Agro Fertilizantes",
                "quotations": [
                    {"title": "Fertilizante NPK 20-10-10", "category": QuotationCategory.AGRICULTURE, "product_type": "Fertilizante", "price": 450.00, "quantity": 40, "unit": "saco"},
                    {"title": "Calcário Agrícola", "category": QuotationCategory.AGRICULTURE, "product_type": "Fertilizante", "price": 85.00, "quantity": 50, "unit": "saco"},
                ]
            },
            {
                "cnpj": "44555666000114",
                "email": "pecuaria.moderna@empresa.com",
                "nickname": "Pecuária Moderna",
                "quotations": [
                    {"title": "Ração para Bezerros", "category": QuotationCategory.LIVESTOCK, "product_type": "Ração", "price": 120.00, "quantity": 30, "unit": "saco"},
                    {"title": "Vacina para Gado", "category": QuotationCategory.LIVESTOCK, "product_type": "Vacina", "price": 35.00, "quantity": 100, "unit": "dose"},
                ]
            },
            {
                "cnpj": "55666777000125",
                "email": "sementes.premium@empresa.com",
                "nickname": "Sementes Premium",
                "quotations": [
                    {"title": "Sementes de Soja Transgênica", "category": QuotationCategory.AGRICULTURE, "product_type": "Sementes", "price": 280.00, "quantity": 35, "unit": "saco"},
                    {"title": "Sementes de Feijão", "category": QuotationCategory.AGRICULTURE, "product_type": "Sementes", "price": 150.00, "quantity": 40, "unit": "saco"},
                ]
            },
            {
                "cnpj": "66777888000136",
                "email": "maquinas.agricolas@empresa.com",
                "nickname": "Máquinas Agrícolas",
                "quotations": [
                    {"title": "Trator Agrícola Usado", "category": QuotationCategory.AGRICULTURE, "product_type": "Máquina", "price": 85000.00, "quantity": 2, "unit": "unidade"},
                    {"title": "Pulverizador Agrícola", "category": QuotationCategory.AGRICULTURE, "product_type": "Máquina", "price": 12000.00, "quantity": 3, "unit": "unidade"},
                ]
            },
            {
                "cnpj": "77888999000147",
                "email": "insumos.agro@empresa.com",
                "nickname": "Insumos Agro",
                "quotations": [
                    {"title": "Herbicida Glifosato 5L", "category": QuotationCategory.AGRICULTURE, "product_type": "Defensivo", "price": 195.00, "quantity": 25, "unit": "litro"},
                    {"title": "Inseticida para Soja", "category": QuotationCategory.AGRICULTURE, "product_type": "Defensivo", "price": 175.00, "quantity": 20, "unit": "litro"},
                ]
            },
            {
                "cnpj": "88999000000158",
                "email": "pastagem.verde@empresa.com",
                "nickname": "Pastagem Verde",
                "quotations": [
                    {"title": "Sementes de Brachiaria BRS Piatã", "category": QuotationCategory.AGRICULTURE, "product_type": "Sementes", "price": 125.00, "quantity": 45, "unit": "saco"},
                    {"title": "Adubo para Pastagem", "category": QuotationCategory.AGRICULTURE, "product_type": "Fertilizante", "price": 380.00, "quantity": 30, "unit": "saco"},
                ]
            },
            {
                "cnpj": "99000111000169",
                "email": "gado.qualidade@empresa.com",
                "nickname": "Gado de Qualidade",
                "quotations": [
                    {"title": "Vaca Leiteira Holandesa", "category": QuotationCategory.LIVESTOCK, "product_type": "Gado", "price": 4500.00, "quantity": 5, "unit": "cabeça"},
                    {"title": "Ração para Gado Leiteiro", "category": QuotationCategory.LIVESTOCK, "product_type": "Ração", "price": 110.00, "quantity": 50, "unit": "saco"},
                ]
            },
            {
                "cnpj": "00111222000170",
                "email": "agro.completo@empresa.com",
                "nickname": "Agro Completo",
                "quotations": [
                    {"title": "Kit Completo para Pecuária", "category": QuotationCategory.BOTH, "product_type": "Kit", "price": 850.00, "quantity": 10, "unit": "kit"},
                    {"title": "Arame Farpado 12x12 500m", "category": QuotationCategory.BOTH, "product_type": "Arame", "price": 265.00, "quantity": 18, "unit": "rolo"},
                ]
            },
        ]
        
        created = 0
        for empresa in empresas_data:
            # Tenta buscar CNPJ real, se falhar usa dados fictícios
            cnpj_data = await get_cnpj_data(empresa["cnpj"])
            
            if not cnpj_data:
                # Usa dados fictícios
                cnpj_data = {
                    "cnpj": empresa["cnpj"],
                    "razao_social": empresa["nickname"],
                    "nome_fantasia": empresa["nickname"],
                    "logradouro": "Rua Principal",
                    "numero": "100",
                    "bairro": "Centro",
                    "cep": "77000000",
                    "municipio": "Palmas",
                    "uf": "TO",
                    "email": empresa["email"],
                }
            
            try:
                create_company_with_quotations(
                    db, cnpj_data, empresa["email"], "Senha123!",
                    empresa["nickname"], empresa["quotations"]
                )
                created += 1
            except Exception as e:
                print(f"❌ Erro ao criar {empresa['nickname']}: {e}")
        
        print(f"\n✅ {created} empresas criadas com sucesso!")
        print(f"   Total de cotações: {sum(len(e['quotations']) for e in empresas_data)}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(main())

