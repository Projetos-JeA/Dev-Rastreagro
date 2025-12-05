"""
Script completo para criar dados dinâmicos e interligados
- Limpa o banco
- Cria perfis com dados relacionados
- Cria ofertas e cotações que fazem match
- Tudo dinâmico e interligado
Uso: python -m app.scripts.create_complete_dynamic_data
"""

import sys
from pathlib import Path
from datetime import datetime
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

# Produtos por categoria para criar matches
PRODUTOS_AGRICULTURA = [
    {"title": "Sementes de Soja Premium", "product_type": "Sementes de Soja", "price": 185.50},
    {"title": "Fertilizante NPK 20-10-10", "product_type": "Fertilizante", "price": 245.00},
    {"title": "Defensivo Herbicida Glifosato", "product_type": "Defensivo Agrícola", "price": 89.90},
    {"title": "Sementes de Milho Híbrido", "product_type": "Sementes de Milho", "price": 320.00},
    {"title": "Arame Farpado Galvanizado", "product_type": "Insumos Agrícolas", "price": 1329.99},
]

PRODUTOS_PECUARIA = [
    {"title": "Ração Premium para Bovinos", "product_type": "Ração Animal", "price": 675.00},
    {"title": "Sal Mineral Premium para Bovinos", "product_type": "Suplemento Animal", "price": 99.99},
    {"title": "Sementes de Capim Mombaça", "product_type": "Sementes de Pastagem", "price": 132.99},
    {"title": "Boi Nelore Macho", "product_type": "Bovino", "price": 4500.00},
    {"title": "Vaca Leiteira Holandesa", "product_type": "Bovino", "price": 5500.00},
]

SERVICOS = [
    {"title": "Serviço de Pulverização Aérea", "product_type": "Pulverização", "price": 85.00},
    {"title": "Serviço de Plantio Direto", "product_type": "Plantio", "price": 120.00},
    {"title": "Serviço de Colheita Mecanizada", "product_type": "Colheita", "price": 150.00},
    {"title": "Serviço de Inseminação Artificial", "product_type": "Inseminação", "price": 200.00},
    {"title": "Serviço de Aplicação de Fertilizante", "product_type": "Aplicação", "price": 95.00},
]


def limpar_banco(db: Session):
    """Limpa todas as tabelas do banco"""
    print("🧹 Limpando banco de dados...")
    
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
    categoria_interesse: str = None,  # 'agriculture', 'livestock', 'service'
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
            cpf = f"{random.randint(10000000000, 99999999999):011d}"
        
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
            cnpj = f"{random.randint(10000000000000, 99999999999999):014d}"
        
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
        
        # Adiciona atividades baseadas na categoria de interesse
        categories = activity_repo.list_categories()
        if categories and categoria_interesse:
            # Busca categoria que corresponde ao interesse
            if categoria_interesse == "agriculture":
                agri_cat = next(
                    (c for c in categories if "agricultura" in c.name.lower() or "agriculture" in c.name.lower()),
                    categories[0],
                )
                activity = CompanyActivity(company_id=company.id, category_id=agri_cat.id)
                db.add(activity)
            elif categoria_interesse == "livestock":
                pecu_cat = next(
                    (c for c in categories if "pecuária" in c.name.lower() or "livestock" in c.name.lower()),
                    categories[0] if categories else None,
                )
                if pecu_cat:
                    activity = CompanyActivity(company_id=company.id, category_id=pecu_cat.id)
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


def criar_oferta(db: Session, seller_id: int, seller_type: str, produto: dict, categoria: QuotationCategory):
    """Cria uma oferta"""
    estado = random.choice(ESTADOS)
    cidade = random.choice(CIDADES[estado])
    
    oferta = Quotation(
        type=QuotationType.OFFER.value,
        seller_id=seller_id,
        seller_type=seller_type,
        buyer_id=None,
        title=produto["title"],
        description=f"Oferta de {produto['title']}. Produto de qualidade, pronto para entrega.",
        category=categoria,
        product_type=produto.get("product_type"),
        location_city=cidade,
        location_state=estado,
        price=produto.get("price"),
        quantity=random.randint(10, 100),
        unit="unidade" if categoria == QuotationCategory.SERVICE else "kg",
        stock=random.randint(10, 100),
        status=QuotationStatus.ACTIVE,
    )
    db.add(oferta)
    db.commit()
    return oferta


def criar_cotacao(db: Session, buyer_id: int, produto: dict, categoria: QuotationCategory):
    """Cria uma cotação"""
    estado = random.choice(ESTADOS)
    cidade = random.choice(CIDADES[estado])
    
    cotacao = Quotation(
        type=QuotationType.QUOTATION.value,
        buyer_id=buyer_id,
        seller_id=None,
        seller_type=None,
        title=f"Preciso de {produto['title']}",
        description=f"Buscando {produto['title']}. Preciso de produto de qualidade.",
        category=categoria,
        product_type=produto.get("product_type"),
        location_city=cidade,
        location_state=estado,
        status=QuotationStatus.ACTIVE,
    )
    db.add(cotacao)
    db.commit()
    return cotacao


def main():
    db = SessionLocal()
    
    try:
        # Limpa o banco
        limpar_banco(db)
        
        print("👥 Criando perfis...\n")
        
        usuarios = {}
        
        # 1. PRODUTORES COM CPF (3)
        print("1️⃣ PRODUTORES COM CPF (3):")
        for i in range(1, 4):
            email = f"produtor_cpf{i}@teste.com"
            categoria = "agriculture" if i % 2 == 1 else "livestock"
            user = criar_usuario(
                db=db,
                email=email,
                nickname=f"Produtor CPF {i}",
                role=UserRole.BUYER,
                criar_buyer=True,
                categoria_interesse=categoria,
            )
            usuarios[f"produtor_cpf{i}"] = {"user": user, "categoria": categoria}
            print(f"   ✅ {email} criado (interesse: {categoria})\n")
        
        # 2. PRODUTORES COM CNPJ (3)
        print("2️⃣ PRODUTORES COM CNPJ (3):")
        for i in range(1, 4):
            email = f"produtor_cnpj{i}@teste.com"
            categoria = "agriculture" if i % 2 == 1 else "livestock"
            user = criar_usuario(
                db=db,
                email=email,
                nickname=f"Produtor CNPJ {i}",
                role=UserRole.BUYER,
                criar_buyer=True,
                criar_company=True,
                categoria_interesse=categoria,
            )
            usuarios[f"produtor_cnpj{i}"] = {"user": user, "categoria": categoria}
            print(f"   ✅ {email} criado (interesse: {categoria})\n")
        
        # 3. PRODUTOR + FORNECEDOR (3)
        print("3️⃣ PRODUTOR + FORNECEDOR (3):")
        for i in range(1, 4):
            email = f"produtor_fornecedor{i}@teste.com"
            categoria = "agriculture" if i % 2 == 1 else "livestock"
            user = criar_usuario(
                db=db,
                email=email,
                nickname=f"Produtor Fornecedor {i}",
                role=UserRole.BUYER,
                criar_buyer=True,
                criar_company=True,
                categoria_interesse=categoria,
            )
            usuarios[f"produtor_fornecedor{i}"] = {"user": user, "categoria": categoria}
            print(f"   ✅ {email} criado (interesse: {categoria})\n")
        
        # 4. PRODUTOR + PRESTADOR (3)
        print("4️⃣ PRODUTOR + PRESTADOR (3):")
        for i in range(1, 4):
            email = f"produtor_prestador{i}@teste.com"
            categoria = "service"
            user = criar_usuario(
                db=db,
                email=email,
                nickname=f"Produtor Prestador {i}",
                role=UserRole.BUYER,
                criar_buyer=True,
                criar_service=True,
                categoria_interesse=categoria,
            )
            usuarios[f"produtor_prestador{i}"] = {"user": user, "categoria": categoria}
            print(f"   ✅ {email} criado (interesse: {categoria})\n")
        
        # 5. FORNECEDOR + PRESTADOR (3)
        print("5️⃣ FORNECEDOR + PRESTADOR (3):")
        for i in range(1, 4):
            email = f"fornecedor_prestador{i}@teste.com"
            categoria = "agriculture" if i % 2 == 1 else "livestock"
            user = criar_usuario(
                db=db,
                email=email,
                nickname=f"Fornecedor Prestador {i}",
                role=UserRole.SELLER,
                criar_company=True,
                criar_service=True,
                categoria_interesse=categoria,
            )
            usuarios[f"fornecedor_prestador{i}"] = {"user": user, "categoria": categoria}
            print(f"   ✅ {email} criado (interesse: {categoria})\n")
        
        # 6. PRESTADOR + PRODUTOR (3) - mesmo que Produtor + Prestador, mas com role diferente
        print("6️⃣ PRESTADOR + PRODUTOR (3):")
        for i in range(1, 4):
            email = f"prestador_produtor{i}@teste.com"
            categoria = "service"
            user = criar_usuario(
                db=db,
                email=email,
                nickname=f"Prestador Produtor {i}",
                role=UserRole.SERVICE_PROVIDER,
                criar_buyer=True,
                criar_service=True,
                categoria_interesse=categoria,
            )
            usuarios[f"prestador_produtor{i}"] = {"user": user, "categoria": categoria}
            print(f"   ✅ {email} criado (interesse: {categoria})\n")
        
        print("=" * 60)
        print("📦 Criando ofertas e cotações...\n")
        
        # Cria ofertas e cotações para cada usuário
        todas_ofertas = []
        todas_cotacoes = []
        
        for key, data in usuarios.items():
            user = data["user"]
            categoria_interesse = data["categoria"]
            
            print(f"📋 Criando produtos para {user.email} (categoria: {categoria_interesse})...")
            
            # Determina produtos baseados na categoria
            if categoria_interesse == "agriculture":
                produtos = PRODUTOS_AGRICULTURA
                categoria_enum = QuotationCategory.AGRICULTURE
            elif categoria_interesse == "livestock":
                produtos = PRODUTOS_PECUARIA
                categoria_enum = QuotationCategory.LIVESTOCK
            else:
                produtos = SERVICOS
                categoria_enum = QuotationCategory.SERVICE
            
            # Verifica se é fornecedor/prestador (pode criar ofertas)
            company_obj = db.query(Company).filter(Company.user_id == user.id).first()
            service_obj = db.query(ServiceProvider).filter(ServiceProvider.user_id == user.id).first()
            
            # Cria 3 ofertas
            for j, produto in enumerate(produtos[:3]):
                if company_obj:
                    seller_type = "company"
                elif service_obj:
                    seller_type = "service_provider"
                else:
                    seller_type = "buyer"
                
                oferta = criar_oferta(db, user.id, seller_type, produto, categoria_enum)
                todas_ofertas.append(oferta)
                print(f"   ✅ Oferta '{oferta.title}' criada por {user.email} ({user.nickname})")
            
            # Verifica se é produtor (pode criar cotações)
            buyer_obj = db.query(BuyerProfile).filter(BuyerProfile.user_id == user.id).first()
            
            # Cria 3 cotações
            if buyer_obj:
                for j, produto in enumerate(produtos[:3]):
                    cotacao = criar_cotacao(db, user.id, produto, categoria_enum)
                    todas_cotacoes.append(cotacao)
                    print(f"   ✅ Cotação '{cotacao.title}' criada por {user.email} ({user.nickname})")
            
            print()
        
        print("=" * 60)
        print("✅ CRIAÇÃO COMPLETA!")
        print("=" * 60)
        print(f"👥 Usuários criados: {len(usuarios)}")
        print(f"📦 Ofertas criadas: {len(todas_ofertas)}")
        print(f"📋 Cotações criadas: {len(todas_cotacoes)}")
        print()
        print("🔑 Senha padrão para todos: Senha123!")
        print("✅ Todos os emails estão verificados")
        print()
        print("📊 Resumo por tipo:")
        print("   • 3 Produtores CPF")
        print("   • 3 Produtores CNPJ")
        print("   • 3 Produtores + Fornecedores")
        print("   • 3 Produtores + Prestadores")
        print("   • 3 Fornecedores + Prestadores")
        print("   • 3 Prestadores + Produtores")
        print()
        print("💡 MATCHES ESPERADOS:")
        print("   • Produtores veem ofertas compatíveis com suas cotações")
        print("   • Fornecedores veem cotações compatíveis com suas ofertas")
        print("   • Tudo dinâmico e interligado!")
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

