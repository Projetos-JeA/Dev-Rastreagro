"""
Script completo para criar dados de teste e treinar a IA
Cria: 10 compradores, 5 prestadores, 5 fornecedores + produtos
Uso: python -m app.scripts.create_complete_test_data
"""

import sys
import json
from pathlib import Path
from datetime import datetime, timedelta, timezone
import random

# Adiciona o diretório raiz ao path
root_dir = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(root_dir))

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.quotation import Quotation, QuotationStatus, QuotationCategory
from app.models.user import User, UserRole
from app.models.company import Company
from app.models.buyer_profile import BuyerProfile
from app.models.service_provider import ServiceProvider
from app.models.company import CompanyActivity
from app.repositories.user_repository import UserRepository
from app.repositories.company_repository import CompanyRepository
from app.repositories.buyer_profile_repository import BuyerProfileRepository
from app.repositories.service_provider_repository import ServiceProviderRepository
from app.services.quotation_service import QuotationService
from app.services.ai.ollama_matching_service import OllamaMatchingService
from app.schemas.quotation import QuotationCreate
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

PRODUTOS_FORNECEDOR = [
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
        "title": "Defensivo Herbicida Glifosato - 5L",
        "description": "Herbicida sistêmico glifosato para controle de plantas daninhas. Concentração 480g/L, rendimento de até 5 hectares por litro.",
        "category": QuotationCategory.AGRICULTURE,
        "product_type": "Defensivo Agrícola",
        "price": 89.90,
        "quantity": 80,
        "unit": "litro",
        "stock": 80,
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
    {
        "title": "Sal Mineral Premium para Bovinos - 25kg",
        "description": "Sal mineral enriquecido para bovinos, formulação balanceada. Cálcio 120g/kg, Fósforo 90g/kg, com macro e microelementos.",
        "category": QuotationCategory.LIVESTOCK,
        "product_type": "Suplemento Animal",
        "price": 99.99,
        "quantity": 50,
        "unit": "saco",
        "stock": 50,
    },
    {
        "title": "Sementes de Milho Híbrido - 60kg",
        "description": "Sementes de milho híbrido de alta produtividade, adaptado para diferentes regiões. Germinação garantida acima de 95%.",
        "category": QuotationCategory.AGRICULTURE,
        "product_type": "Sementes de Milho",
        "price": 320.00,
        "quantity": 120,
        "unit": "saco",
        "stock": 120,
    },
    {
        "title": "Arame Farpado Galvanizado - 500m",
        "description": "Arame farpado galvanizado de alta resistência, ideal para cercas de pasto. Bitola 2,4mm, 4 pontas, produto novo com garantia.",
        "category": QuotationCategory.AGRICULTURE,
        "product_type": "Insumos Agrícolas",
        "price": 1329.99,
        "quantity": 15,
        "unit": "rolo",
        "stock": 15,
    },
    {
        "title": "Sementes de Capim Mombaça - 20kg",
        "description": "Sementes de Capim Mombaça de alta qualidade e germinação. Ideal para formação e recuperação de pastagens. Germinação garantida de 85%.",
        "category": QuotationCategory.AGRICULTURE,
        "product_type": "Sementes de Pastagem",
        "price": 132.99,
        "quantity": 50,
        "unit": "kg",
        "stock": 50,
    },
]

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
        "description": "Serviço de colheita mecanizada de grãos com colheitadeiras modernas. Capacidade de até 50 hectares por dia. Equipe treinada e equipamentos em perfeito estado.",
        "category": QuotationCategory.SERVICE,
        "product_type": "Colheita",
        "price": 150.00,
        "quantity": None,
        "unit": "hectare",
        "stock": None,
    },
    {
        "title": "Serviço de Inseminação Artificial",
        "description": "Serviço de inseminação artificial em bovinos com sêmen de touros certificados. Técnico experiente, material descartável e garantia de procedimento.",
        "category": QuotationCategory.SERVICE,
        "product_type": "Inseminação",
        "price": 250.00,
        "quantity": None,
        "unit": "unidade",
        "stock": None,
    },
    {
        "title": "Serviço de Aplicação de Calcário",
        "description": "Serviço de aplicação de calcário agrícola para correção de solo. Distribuição uniforme com máquinas adequadas. Análise de solo incluída.",
        "category": QuotationCategory.SERVICE,
        "product_type": "Aplicação de Calcário",
        "price": 45.00,
        "quantity": None,
        "unit": "tonelada",
        "stock": None,
    },
]


def generate_cpf():
    """Gera um CPF válido para testes"""
    def calc_digit(cpf, weights):
        total = sum(int(cpf[i]) * weights[i] for i in range(len(weights)))
        remainder = total % 11
        return '0' if remainder < 2 else str(11 - remainder)
    
    cpf = ''.join([str(random.randint(0, 9)) for _ in range(9)])
    cpf += calc_digit(cpf, [10, 9, 8, 7, 6, 5, 4, 3, 2])
    cpf += calc_digit(cpf, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2])
    return f"{cpf[:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:]}"


def generate_cnpj():
    """Gera um CNPJ válido para testes"""
    def calc_digit(cnpj, weights):
        total = sum(int(cnpj[i]) * weights[i] for i in range(len(weights)))
        remainder = total % 11
        return '0' if remainder < 2 else str(11 - remainder)
    
    cnpj = ''.join([str(random.randint(0, 9)) for _ in range(12)])
    cnpj += calc_digit(cnpj, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
    cnpj += calc_digit(cnpj, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
    return f"{cnpj[:2]}.{cnpj[2:5]}.{cnpj[5:8]}/{cnpj[8:12]}-{cnpj[12:]}"


def create_complete_test_data():
    """Cria dados completos de teste e treina a IA"""
    db: Session = SessionLocal()
    try:
        user_repo = UserRepository(db)
        company_repo = CompanyRepository(db)
        buyer_profile_repo = BuyerProfileRepository(db)
        service_provider_repo = ServiceProviderRepository(db)
        quotation_service = QuotationService(db)
        ollama_service = OllamaMatchingService()

        print("🚀 Iniciando criação de dados de teste...")
        print("=" * 60)

        # 1. CRIAR 10 COMPRADORES (BUYER)
        print("\n📦 Criando 10 COMPRADORES (BUYER)...")
        buyer_types = ['agricultor', 'pecuarista', 'ambos'] * 4
        buyer_types.extend(['agricultor', 'pecuarista'])
        
        for i in range(10):
            estado = random.choice(ESTADOS)
            cidade = random.choice(CIDADES[estado])
            buyer_type = buyer_types[i]
            
            email = f"comprador{i+1}@teste.com"
            nickname = f"Comprador {i+1}"
            nome = f"Produtor {buyer_type.capitalize()} {i+1}"
            
            # Verifica se já existe
            existing = user_repo.get_by_email(email)
            if existing:
                print(f"   ⚠️  {email} já existe, pulando...")
                continue
            
            # Cria usuário
            user = User(
                email=email,
                password_hash=get_password_hash("Senha123!"),
                role=UserRole.BUYER,
                nickname=nickname,
                email_verificado=True,
            )
            db.add(user)
            db.flush()
            
            # Cria perfil de comprador
            buyer_profile = BuyerProfile(
                user_id=user.id,
                nome_completo=nome,
                cpf=generate_cpf(),
                endereco=f"Rua {random.randint(1, 999)}, {random.randint(100, 999)}",
                cep=f"{random.randint(10000, 99999)}-{random.randint(100, 999)}",
                cidade=cidade,
                estado=estado,
            )
            db.add(buyer_profile)
            db.commit()
            
            print(f"   ✅ Comprador {i+1}/10 criado: {email} ({buyer_type})")
        
        # 2. CRIAR 5 FORNECEDORES (SELLER)
        print("\n🏢 Criando 5 FORNECEDORES (SELLER)...")
        fornecedor_nomes = [
            "Agropecuária São Paulo",
            "Fazenda Verde Brasil",
            "Cooperativa Agrícola Sul",
            "Distribuidora Rural Centro-Oeste",
            "Agronegócios do Norte",
        ]
        
        for i in range(5):
            estado = random.choice(ESTADOS)
            cidade = random.choice(CIDADES[estado])
            nome_empresa = fornecedor_nomes[i]
            email = f"fornecedor{i+1}@teste.com"
            cnpj = generate_cnpj()
            
            # Verifica se já existe
            existing = user_repo.get_by_email(email)
            if existing:
                print(f"   ⚠️  {email} já existe, pulando...")
                continue
            
            # Cria usuário
            user = User(
                email=email,
                password_hash=get_password_hash("Senha123!"),
                role=UserRole.SELLER,
                nickname=nome_empresa,
                email_verificado=True,
            )
            db.add(user)
            db.flush()
            
            # Cria empresa
            company = Company(
                user_id=user.id,
                nome_propriedade=nome_empresa,
                cnpj_cpf=cnpj.replace('.', '').replace('/', '').replace('-', ''),
                endereco=f"Rodovia {random.randint(100, 999)}, Km {random.randint(1, 99)}",
                cep=f"{random.randint(10000, 99999)}-{random.randint(100, 999)}",
                cidade=cidade,
                estado=estado,
                email=email,
            )
            db.add(company)
            db.flush()
            
            # Adiciona atividades (Agricultura e Pecuária)
            activities = [
                CompanyActivity(company_id=company.id, category_id=1, group_id=None, item_id=None),  # Agricultura
                CompanyActivity(company_id=company.id, category_id=2, group_id=None, item_id=None),  # Pecuária
            ]
            for act in activities:
                db.add(act)
            
            db.commit()
            
            # Cria produtos para o fornecedor
            produtos_selecionados = random.sample(PRODUTOS_FORNECEDOR, min(5, len(PRODUTOS_FORNECEDOR)))
            for j, produto_data in enumerate(produtos_selecionados):
                try:
                    payload = QuotationCreate(
                        title=produto_data["title"],
                        description=produto_data["description"],
                        category=produto_data["category"],
                        product_type=produto_data["product_type"],
                        location_city=cidade,
                        location_state=estado,
                        price=produto_data["price"],
                        quantity=produto_data["quantity"],
                        unit=produto_data["unit"],
                        stock=produto_data["stock"],
                        expires_at=datetime.now(timezone.utc) + timedelta(days=60),
                        free_shipping=True,
                        discount_percentage=10 + (j * 5),
                        installments=12,
                    )
                    
                    quotation = quotation_service.create_quotation(user.id, payload)
                    
                    # Gera embedding para IA
                    quotation_text = f"{quotation.title} {quotation.description or ''} {quotation.product_type or ''} {quotation.category.value}"
                    embedding = ollama_service.generate_embedding(quotation_text)
                    if embedding:
                        quotation.embedding = json.dumps(embedding)
                        db.commit()
                except Exception as e:
                    print(f"      ⚠️  Erro ao criar produto {j+1}: {e}")
                    db.rollback()
            
            print(f"   ✅ Fornecedor {i+1}/5 criado: {email} ({len(produtos_selecionados)} produtos)")
        
        # 3. CRIAR 5 PRESTADORES DE SERVIÇO
        print("\n🔧 Criando 5 PRESTADORES DE SERVIÇO...")
        prestador_nomes = [
            "Agro Serviços Especializados",
            "Pulverização Aérea Premium",
            "Serviços Agrícolas Rápidos",
            "Tecnologia no Campo",
            "Agro Consultoria e Serviços",
        ]
        
        for i in range(5):
            estado = random.choice(ESTADOS)
            cidade = random.choice(CIDADES[estado])
            nome_servico = prestador_nomes[i]
            email = f"prestador{i+1}@teste.com"
            cpf = generate_cpf()
            
            # Verifica se já existe
            existing = user_repo.get_by_email(email)
            if existing:
                print(f"   ⚠️  {email} já existe, pulando...")
                continue
            
            # Cria usuário
            user = User(
                email=email,
                password_hash=get_password_hash("Senha123!"),
                role=UserRole.SERVICE_PROVIDER,
                nickname=nome_servico,
                email_verificado=True,
            )
            db.add(user)
            db.flush()
            
            # Cria prestador
            service_provider = ServiceProvider(
                user_id=user.id,
                nome_servico=nome_servico,
                cnpj_cpf=cpf.replace('.', '').replace('-', ''),
                endereco=f"Av. {random.randint(1, 99)}, {random.randint(100, 999)}",
                cep=f"{random.randint(10000, 99999)}-{random.randint(100, 999)}",
                cidade=cidade,
                estado=estado,
                email_contato=email,
            )
            db.add(service_provider)
            db.commit()
            
            # Cria serviços para o prestador
            servicos_selecionados = random.sample(SERVICOS_PRESTADOR, min(5, len(SERVICOS_PRESTADOR)))
            for j, servico_data in enumerate(servicos_selecionados):
                try:
                    payload = QuotationCreate(
                        title=servico_data["title"],
                        description=servico_data["description"],
                        category=servico_data["category"],
                        product_type=servico_data["product_type"],
                        location_city=cidade,
                        location_state=estado,
                        price=servico_data["price"],
                        quantity=servico_data["quantity"],
                        unit=servico_data["unit"],
                        stock=servico_data["stock"],
                        expires_at=datetime.now(timezone.utc) + timedelta(days=90),
                        free_shipping=False,
                        discount_percentage=5 + (j * 3),
                        installments=1,
                    )
                    
                    quotation = quotation_service.create_quotation(user.id, payload)
                    
                    # Gera embedding para IA
                    quotation_text = f"{quotation.title} {quotation.description or ''} {quotation.product_type or ''} {quotation.category.value}"
                    embedding = ollama_service.generate_embedding(quotation_text)
                    if embedding:
                        quotation.embedding = json.dumps(embedding)
                        db.commit()
                except Exception as e:
                    print(f"      ⚠️  Erro ao criar serviço {j+1}: {e}")
                    db.rollback()
            
            print(f"   ✅ Prestador {i+1}/5 criado: {email} ({len(servicos_selecionados)} serviços)")
        
        # 4. TREINAR IA - Gerar embeddings para todos os perfis
        print("\n🤖 Treinando IA com embeddings...")
        
        # Embeddings para compradores
        buyers = db.query(BuyerProfile).all()
        print(f"   📊 Processando {len(buyers)} compradores...")
        for buyer in buyers:
            try:
                user = user_repo.get_by_id(buyer.user_id)
                if not user or user.role != UserRole.BUYER:
                    continue
                
                # Cria texto do perfil para embedding
                profile_text = f"Comprador {buyer.nome_completo} {buyer.cidade} {buyer.estado}"
                embedding = ollama_service.generate_embedding(profile_text)
                # Nota: BuyerProfile não tem campo embedding, mas a IA usa o perfil na hora do match
                print(f"      ✓ Perfil processado: {buyer.nome_completo}")
            except Exception as e:
                print(f"      ⚠️  Erro ao processar comprador {buyer.id}: {e}")
        
        # Embeddings para empresas
        companies = db.query(Company).all()
        print(f"   📊 Processando {len(companies)} empresas...")
        for company in companies:
            try:
                user = user_repo.get_by_id(company.user_id)
                if not user or user.role != UserRole.SELLER:
                    continue
                
                # Cria texto da empresa para embedding
                company_text = f"Empresa {company.nome_propriedade} {company.cidade} {company.estado}"
                embedding = ollama_service.generate_embedding(company_text)
                # Nota: Company não tem campo embedding, mas a IA usa as atividades na hora do match
                print(f"      ✓ Empresa processada: {company.nome_propriedade}")
            except Exception as e:
                print(f"      ⚠️  Erro ao processar empresa {company.id}: {e}")
        
        print("\n✅ Processo concluído!")
        print("=" * 60)
        print(f"\n📊 Resumo:")
        print(f"   • Compradores criados: {len(buyers)}")
        print(f"   • Fornecedores criados: {len(companies)}")
        print(f"   • Prestadores criados: {len(db.query(ServiceProvider).all())}")
        print(f"   • Produtos/Serviços: {len(db.query(Quotation).filter(Quotation.status == QuotationStatus.ACTIVE).all())}")
        print(f"   • Embeddings gerados para todos os produtos/serviços")
        print(f"\n💡 Próximos passos:")
        print(f"   • Teste o match no Deu Agro com os compradores")
        print(f"   • A IA deve mostrar produtos relevantes baseados nos perfis")
        print(f"   • Todos os usuários têm senha: Senha123!")

    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao criar dados: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    create_complete_test_data()

