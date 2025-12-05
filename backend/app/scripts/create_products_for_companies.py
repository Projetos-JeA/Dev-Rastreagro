"""
Script para criar produtos/cotações para empresas existentes
Cria 5 produtos para cada tipo: Prestador, Fornecedor e Produtor com CNPJ
Uso: python -m app.scripts.create_products_for_companies
"""

import sys
import json
from pathlib import Path
from datetime import datetime, timedelta, timezone

# Adiciona o diretório raiz ao path
root_dir = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(root_dir))

from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.database import SessionLocal
from app.models.quotation import Quotation, QuotationStatus, QuotationCategory
from app.models.user import User, UserRole
from app.models.company import Company
from app.models.service_provider import ServiceProvider
from app.repositories.user_repository import UserRepository
from app.repositories.company_repository import CompanyRepository
from app.services.quotation_service import QuotationService
from app.services.ai.matching_service import MatchingService
from app.schemas.quotation import QuotationCreate


def get_password_hash(password: str) -> str:
    """Gera hash da senha"""
    from app.core.security import get_password_hash
    return get_password_hash(password)


def reset_passwords_to_default(db: Session):
    """Reseta todas as senhas para Senha123!"""
    from app.core.security import get_password_hash
    
    users = db.query(User).all()
    password_hash = get_password_hash("Senha123!")
    
    updated = 0
    for user in users:
        user.password_hash = password_hash
        updated += 1
    
    db.commit()
    print(f"✅ {updated} senhas atualizadas para 'Senha123!'")


def create_products_for_companies():
    """Cria produtos para todas as empresas existentes"""
    db: Session = SessionLocal()
    try:
        user_repo = UserRepository(db)
        company_repo = CompanyRepository(db)
        quotation_service = QuotationService(db)
        matching_service = MatchingService(db)

        # Reseta senhas
        print("🔐 Padronizando senhas para 'Senha123!'...")
        reset_passwords_to_default(db)

        # Busca todas as empresas (fornecedores e produtores com CNPJ)
        companies = db.query(Company).all()
        print(f"\n📋 Encontradas {len(companies)} empresas no banco")

        # Busca todos os prestadores de serviço
        service_providers = db.query(ServiceProvider).all()
        print(f"📋 Encontrados {len(service_providers)} prestadores de serviço")

        # Produtos para FORNECEDORES (companies)
        supplier_products = [
            {
                "title": "Sementes de Soja Transgênica - 50kg",
                "description": "Sementes de soja transgênica de alta produtividade, certificada. Variedade resistente a herbicidas, germinação garantida acima de 90%. Ideal para plantio direto.",
                "category": QuotationCategory.AGRICULTURE,
                "product_type": "Sementes de Soja",
                "price": 185.50,
                "quantity": 200,
                "unit": "saco",
                "stock": 200,
            },
            {
                "title": "Fertilizante NPK 20-10-10 - 50kg",
                "description": "Fertilizante granulado NPK balanceado para adubação de base. Composição: 20% Nitrogênio, 10% Fósforo, 10% Potássio. Ideal para culturas de grãos.",
                "category": QuotationCategory.AGRICULTURE,
                "product_type": "Fertilizante",
                "price": 245.00,
                "quantity": 150,
                "unit": "saco",
                "stock": 150,
            },
            {
                "title": "Defensivo Herbicida Glifosato - 5L",
                "description": "Herbicida sistêmico glifosato para controle de plantas daninhas. Concentração 480g/L, rendimento de até 5 hectares por litro. Registrado no MAPA.",
                "category": QuotationCategory.AGRICULTURE,
                "product_type": "Defensivo Agrícola",
                "price": 89.90,
                "quantity": 80,
                "unit": "litro",
                "stock": 80,
            },
            {
                "title": "Ração Premium para Bovinos - 50kg",
                "description": "Ração balanceada premium para bovinos de corte e leite. Proteína 18%, Energia 2.800 kcal/kg. Formulação completa com vitaminas e minerais essenciais.",
                "category": QuotationCategory.LIVESTOCK,
                "product_type": "Ração Animal",
                "price": 675.00,
                "quantity": 100,
                "unit": "saco",
                "stock": 100,
            },
            {
                "title": "Sal Mineral Premium para Bovinos - 25kg",
                "description": "Sal mineral enriquecido para bovinos, formulação balanceada. Cálcio 120g/kg, Fósforo 90g/kg, com macro e microelementos. Tipo seca das águas.",
                "category": QuotationCategory.LIVESTOCK,
                "product_type": "Suplemento Animal",
                "price": 99.99,
                "quantity": 50,
                "unit": "saco",
                "stock": 50,
            },
        ]

        # Produtos para PRESTADORES DE SERVIÇO
        service_products = [
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

        created_count = 0

        # Cria produtos para FORNECEDORES (companies)
        for company in companies:
            user = user_repo.get_by_id(company.user_id)
            if not user or user.role != UserRole.SELLER:
                continue

            print(f"\n🏢 Criando produtos para: {company.nome_propriedade} (CNPJ: {company.cnpj_cpf})")
            
            for i, product_data in enumerate(supplier_products, 1):
                try:
                    payload = QuotationCreate(
                        title=product_data["title"],
                        description=product_data["description"],
                        category=product_data["category"],
                        product_type=product_data["product_type"],
                        location_city=company.cidade,
                        location_state=company.estado,
                        price=product_data["price"],
                        quantity=product_data["quantity"],
                        unit=product_data["unit"],
                        stock=product_data["stock"],
                        expires_at=datetime.now(timezone.utc) + timedelta(days=60),
                        free_shipping=True,
                        discount_percentage=10 + (i * 5),  # 15%, 20%, 25%, 30%, 35%
                        installments=12,
                    )

                    quotation = quotation_service.create_quotation(user.id, payload)
                    
                    # Gera embedding para a IA usando o serviço Ollama
                    try:
                        from app.services.ai.ollama_matching_service import OllamaMatchingService
                        ollama_service = OllamaMatchingService()
                        
                        # Prepara texto da cotação para embedding
                        quotation_text = f"{quotation.title} {quotation.description or ''} {quotation.product_type or ''} {quotation.category.value}"
                        embedding = ollama_service.generate_embedding(quotation_text)
                        
                        if embedding:
                            quotation.embedding = json.dumps(embedding)
                            db.commit()
                            print(f"      ✓ Embedding gerado para IA")
                    except Exception as e:
                        print(f"   ⚠️  Aviso: Não foi possível gerar embedding para '{product_data['title']}': {e}")

                    print(f"   ✅ Produto {i}/5 criado: {product_data['title']}")
                    created_count += 1
                except Exception as e:
                    print(f"   ❌ Erro ao criar produto {i}: {e}")
                    db.rollback()

        # Cria produtos para PRESTADORES DE SERVIÇO
        for service_provider in service_providers:
            user = user_repo.get_by_id(service_provider.user_id)
            if not user:
                continue

            print(f"\n🔧 Criando produtos para: {service_provider.nome_servico} (Prestador ID: {service_provider.id})")
            
            for i, product_data in enumerate(service_products, 1):
                try:
                    payload = QuotationCreate(
                        title=product_data["title"],
                        description=product_data["description"],
                        category=product_data["category"],
                        product_type=product_data["product_type"],
                        location_city=service_provider.cidade,
                        location_state=service_provider.estado,
                        price=product_data["price"],
                        quantity=product_data["quantity"],
                        unit=product_data["unit"],
                        stock=product_data["stock"],
                        expires_at=datetime.now(timezone.utc) + timedelta(days=90),
                        free_shipping=False,
                        discount_percentage=5 + (i * 3),  # 8%, 11%, 14%, 17%, 20%
                        installments=1,
                    )

                    quotation = quotation_service.create_quotation(user.id, payload)
                    
                    # Gera embedding para a IA usando o serviço Ollama
                    try:
                        from app.services.ai.ollama_matching_service import OllamaMatchingService
                        ollama_service = OllamaMatchingService()
                        
                        # Prepara texto da cotação para embedding
                        quotation_text = f"{quotation.title} {quotation.description or ''} {quotation.product_type or ''} {quotation.category.value}"
                        embedding = ollama_service.generate_embedding(quotation_text)
                        
                        if embedding:
                            quotation.embedding = json.dumps(embedding)
                            db.commit()
                            print(f"      ✓ Embedding gerado para IA")
                    except Exception as e:
                        print(f"   ⚠️  Aviso: Não foi possível gerar embedding para '{product_data['title']}': {e}")

                    print(f"   ✅ Produto {i}/5 criado: {product_data['title']}")
                    created_count += 1
                except Exception as e:
                    print(f"   ❌ Erro ao criar produto {i}: {e}")
                    db.rollback()

        print(f"\n✅ Processo concluído!")
        print(f"\n📊 Resumo:")
        print(f"   • Empresas processadas: {len(companies)}")
        print(f"   • Prestadores processados: {len(service_providers)}")
        print(f"   • Total de produtos criados: {created_count}")
        print(f"   • Senhas padronizadas para: 'Senha123!'")
        print(f"\n💡 Próximos passos:")
        print(f"   • Teste o match no Deu Agro")
        print(f"   • Verifique se os produtos aparecem para os produtores")

    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao criar produtos: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    create_products_for_companies()

