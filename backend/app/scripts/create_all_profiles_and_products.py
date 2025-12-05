"""
Script para criar todos os perfis de teste e produtos
Cria: 19 usuários (compradores, produtores, fornecedores, prestadores) + cotações e ofertas
Uso: python -m app.scripts.create_all_profiles_and_products
"""

import sys
from pathlib import Path
from datetime import datetime, timedelta
import random

# Adiciona o diretório raiz ao path
root_dir = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(root_dir))

from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import SessionLocal
from app.models.quotation import Quotation, QuotationStatus, QuotationCategory, QuotationType
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

# CPFs válidos para teste (apenas formato, não são CPFs reais)
CPFS_TESTE = [
    "12345678901",
    "23456789012",
    "34567890123",
    "45678901234",
    "56789012345",
    "67890123456",
    "78901234567",
    "89012345678",
    "90123456789",
    "01234567890",
]

# CNPJs válidos para teste (apenas formato, não são CNPJs reais)
CNPJS_TESTE = [
    "12345678000190",
    "23456789000112",
    "34567890000123",
    "45678901000134",
    "56789012000145",
    "67890123000156",
    "78901234000167",
    "89012345000178",
    "90123456000189",
    "01234567000190",
]

# Produtos para cotações (compradores criam)
PRODUTOS_COTACAO = [
    {
        "title": "Preciso de Sementes de Soja Premium",
        "description": "Buscando sementes de soja transgênica de alta produtividade, certificada. Variedade resistente a herbicidas.",
        "category": QuotationCategory.AGRICULTURE,
        "product_type": "Sementes de Soja",
    },
    {
        "title": "Buscando Fertilizante NPK 20-10-10",
        "description": "Preciso de fertilizante granulado NPK balanceado para adubação de base. Quantidade mínima de 50 sacos.",
        "category": QuotationCategory.AGRICULTURE,
        "product_type": "Fertilizante",
    },
    {
        "title": "Preciso de Ração Premium para Bovinos",
        "description": "Buscando ração balanceada premium para bovinos de corte e leite. Proteína 18%, Energia 2.800 kcal/kg.",
        "category": QuotationCategory.LIVESTOCK,
        "product_type": "Ração Animal",
    },
]

# Produtos para ofertas (fornecedores criam)
PRODUTOS_OFERTA = [
    {
        "title": "Sementes de Soja Premium - 50kg",
        "description": "Sementes de soja transgênica de alta produtividade, certificada. Variedade resistente a herbicidas, germinação garantida acima de 90%.",
        "category": QuotationCategory.AGRICULTURE,
        "product_type": "Sementes de Soja",
        "price": 185.50,
        "quantity": 200,
        "unit": "saco",
        "stock": 200,
    },
    {
        "title": "Fertilizante NPK 20-10-10 - 50kg",
        "description": "Fertilizante granulado NPK balanceado para adubação de base. Composição: 20% Nitrogênio, 10% Fósforo, 10% Potássio.",
        "category": QuotationCategory.AGRICULTURE,
        "product_type": "Fertilizante",
        "price": 245.00,
        "quantity": 150,
        "unit": "saco",
        "stock": 150,
    },
    {
        "title": "Ração Premium para Bovinos - 50kg",
        "description": "Ração balanceada premium para bovinos de corte e leite. Proteína 18%, Energia 2.800 kcal/kg. Formulação completa com vitaminas e minerais.",
        "category": QuotationCategory.LIVESTOCK,
        "product_type": "Ração Animal",
        "price": 675.00,
        "quantity": 100,
        "unit": "saco",
        "stock": 100,
    },
]

# Serviços para prestadores
SERVICOS_PRESTADOR = [
    {
        "title": "Serviço de Pulverização Aérea",
        "description": "Serviço profissional de pulverização aérea com drone agrícola. Aplicação de defensivos, fertilizantes foliares e adjuvantes. Cobertura de até 100 hectares por dia.",
        "category": QuotationCategory.SERVICE,
        "product_type": "Pulverização",
        "price": 85.00,
        "quantity": None,
        "unit": "hectare",
        "stock": None,
    },
    {
        "title": "Serviço de Plantio Direto",
        "description": "Serviço de plantio direto com máquinas modernas. Preparo mínimo do solo, plantio de sementes e aplicação de fertilizantes. Equipe experiente e certificada.",
        "category": QuotationCategory.SERVICE,
        "product_type": "Plantio",
        "price": 120.00,
        "quantity": None,
        "unit": "hectare",
        "stock": None,
    },
    {
        "title": "Serviço de Colheita Mecanizada",
        "description": "Serviço de colheita mecanizada com colheitadeiras modernas. Colheita de soja, milho, trigo e outros grãos. Equipe experiente e equipamentos certificados.",
        "category": QuotationCategory.SERVICE,
        "product_type": "Colheita",
        "price": 150.00,
        "quantity": None,
        "unit": "hectare",
        "stock": None,
    },
]


def limpar_banco(db: Session):
    """Limpa todas as tabelas do banco"""
    print("🧹 Limpando banco de dados...")
    
    # Ordem de exclusão (respeitando foreign keys)
    tables = [
        "quotations",
        "company_activities",
        "service_providers",
        "companies",
        "buyer_profiles",
        "users",
    ]
    
    for table in tables:
        try:
            db.execute(text(f"DELETE FROM {table}"))
            print(f"   ✅ {table} limpa")
        except Exception as e:
            print(f"   ⚠️ Erro ao limpar {table}: {e}")
    
    db.commit()
    print("✅ Banco limpo!\n")


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
            agri_cat = next((c for c in categories if "agricultura" in c.name.lower() or "agriculture" in c.name.lower()), categories[0])
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


def criar_cotacao(db: Session, buyer_id: int, produto: dict):
    """Cria uma cotação (comprador cria)"""
    estado = random.choice(ESTADOS)
    cidade = random.choice(CIDADES[estado])
    
    cotacao = Quotation(
        type=QuotationType.QUOTATION.value,
        buyer_id=buyer_id,
        seller_id=None,
        seller_type=None,
        title=produto["title"],
        description=produto["description"],
        category=produto["category"],
        product_type=produto["product_type"],
        location_city=cidade,
        location_state=estado,
        status=QuotationStatus.ACTIVE,
    )
    db.add(cotacao)
    db.commit()
    return cotacao


def criar_oferta(db: Session, seller_id: int, seller_type: str, produto: dict):
    """Cria uma oferta (vendedor cria)"""
    estado = random.choice(ESTADOS)
    cidade = random.choice(CIDADES[estado])
    
    oferta = Quotation(
        type=QuotationType.OFFER.value,
        seller_id=seller_id,
        seller_type=seller_type,
        buyer_id=None,
        title=produto["title"],
        description=produto["description"],
        category=produto["category"],
        product_type=produto["product_type"],
        location_city=cidade,
        location_state=estado,
        price=produto.get("price"),
        quantity=produto.get("quantity"),
        unit=produto.get("unit"),
        stock=produto.get("stock"),
        status=QuotationStatus.ACTIVE,
    )
    db.add(oferta)
    db.commit()
    return oferta


def main():
    db = SessionLocal()
    
    try:
        # Limpa o banco
        limpar_banco(db)
        
        print("👥 Criando usuários...\n")
        
        # 1. COMPRADORES (4 usuários - apenas BuyerProfile, CPF)
        print("1️⃣ COMPRADORES (4 usuários):")
        compradores = []
        for i in range(1, 5):
            email = f"comprador{i}@teste.com"
            user = criar_usuario(
                db=db,
                email=email,
                nickname=f"Comprador {i}",
                role=UserRole.BUYER,
                criar_buyer=True,
            )
            compradores.append(user)
            print(f"   ✅ {email} criado")
        
        print()
        
        # 2. PRODUTORES COM CNPJ (3 usuários - BuyerProfile + Company CNPJ)
        print("2️⃣ PRODUTORES COM CNPJ (3 usuários):")
        produtores_cnpj = []
        for i in range(1, 4):
            email = f"produtor_cnpj{i}@teste.com"
            user = criar_usuario(
                db=db,
                email=email,
                nickname=f"Produtor CNPJ {i}",
                role=UserRole.BUYER,
                criar_buyer=True,
                criar_company=True,
            )
            produtores_cnpj.append(user)
            print(f"   ✅ {email} criado")
        
        print()
        
        # 3. PRODUTOR + FORNECEDOR (3 usuários - BuyerProfile + Company CNPJ)
        print("3️⃣ PRODUTOR + FORNECEDOR (3 usuários):")
        produtores_fornecedores = []
        for i in range(1, 4):
            email = f"produtor_fornecedor{i}@teste.com"
            user = criar_usuario(
                db=db,
                email=email,
                nickname=f"Produtor Fornecedor {i}",
                role=UserRole.BUYER,
                criar_buyer=True,
                criar_company=True,
            )
            produtores_fornecedores.append(user)
            print(f"   ✅ {email} criado")
        
        print()
        
        # 4. FORNECEDORES (3 usuários - apenas Company CNPJ)
        print("4️⃣ FORNECEDORES (3 usuários):")
        fornecedores = []
        for i in range(1, 4):
            email = f"fornecedor{i}@teste.com"
            user = criar_usuario(
                db=db,
                email=email,
                nickname=f"Fornecedor {i}",
                role=UserRole.SELLER,
                criar_company=True,
            )
            fornecedores.append(user)
            print(f"   ✅ {email} criado")
        
        print()
        
        # 5. PRESTADORES (3 usuários - apenas ServiceProvider)
        print("5️⃣ PRESTADORES (3 usuários):")
        prestadores = []
        for i in range(1, 4):
            email = f"prestador{i}@teste.com"
            user = criar_usuario(
                db=db,
                email=email,
                nickname=f"Prestador {i}",
                role=UserRole.SERVICE_PROVIDER,
                criar_service=True,
            )
            prestadores.append(user)
            print(f"   ✅ {email} criado")
        
        print()
        
        # 6. FORNECEDOR + PRESTADOR (3 usuários - Company + ServiceProvider)
        print("6️⃣ FORNECEDOR + PRESTADOR (3 usuários):")
        fornecedores_prestadores = []
        for i in range(1, 4):
            email = f"fornecedor_prestador{i}@teste.com"
            user = criar_usuario(
                db=db,
                email=email,
                nickname=f"Fornecedor Prestador {i}",
                role=UserRole.SELLER,
                criar_company=True,
                criar_service=True,
            )
            fornecedores_prestadores.append(user)
            print(f"   ✅ {email} criado")
        
        print()
        
        # Criar cotações (compradores criam)
        print("📋 Criando cotações (compradores)...")
        todas_cotacoes = []
        for comprador in compradores:
            for produto in PRODUTOS_COTACAO:
                cotacao = criar_cotacao(db, comprador.id, produto)
                todas_cotacoes.append(cotacao)
                print(f"   ✅ Cotação '{cotacao.title}' criada para {comprador.email}")
        print(f"✅ {len(todas_cotacoes)} cotações criadas!\n")
        
        # Criar ofertas (fornecedores criam)
        print("📦 Criando ofertas (fornecedores)...")
        todas_ofertas = []
        
        # Ofertas de fornecedores simples
        for fornecedor in fornecedores:
            for produto in PRODUTOS_OFERTA:
                oferta = criar_oferta(db, fornecedor.id, "company", produto)
                todas_ofertas.append(oferta)
                print(f"   ✅ Oferta '{oferta.title}' criada por {fornecedor.email}")
        
        # Ofertas de produtores que também são fornecedores
        for prod_forn in produtores_fornecedores:
            for produto in PRODUTOS_OFERTA:
                oferta = criar_oferta(db, prod_forn.id, "company", produto)
                todas_ofertas.append(oferta)
                print(f"   ✅ Oferta '{oferta.title}' criada por {prod_forn.email}")
        
        # Ofertas de fornecedores que também são prestadores (serviços)
        for forn_prest in fornecedores_prestadores:
            for servico in SERVICOS_PRESTADOR:
                oferta = criar_oferta(db, forn_prest.id, "service_provider", servico)
                todas_ofertas.append(oferta)
                print(f"   ✅ Oferta '{oferta.title}' criada por {forn_prest.email}")
        
        print(f"✅ {len(todas_ofertas)} ofertas criadas!\n")
        
        # Criar ofertas de prestadores simples (serviços)
        print("🔧 Criando ofertas de prestadores (serviços)...")
        for prestador in prestadores:
            for servico in SERVICOS_PRESTADOR:
                oferta = criar_oferta(db, prestador.id, "service_provider", servico)
                todas_ofertas.append(oferta)
                print(f"   ✅ Oferta '{oferta.title}' criada por {prestador.email}")
        
        print(f"✅ Total de {len(todas_ofertas)} ofertas criadas!\n")
        
        print("=" * 60)
        print("✅ CRIAÇÃO COMPLETA!")
        print("=" * 60)
        print(f"👥 Usuários criados: 19")
        print(f"📋 Cotações criadas: {len(todas_cotacoes)}")
        print(f"📦 Ofertas criadas: {len(todas_ofertas)}")
        print()
        print("🔑 Senha padrão para todos: Senha123!")
        print("✅ Todos os emails estão verificados")
        print()
        print("📊 Resumo:")
        print("   • 4 Compradores (CPF)")
        print("   • 3 Produtores com CNPJ")
        print("   • 3 Produtores + Fornecedores")
        print("   • 3 Fornecedores")
        print("   • 3 Prestadores")
        print("   • 3 Fornecedores + Prestadores")
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

