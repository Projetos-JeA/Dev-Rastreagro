"""Script simples para popular banco de dados"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.database import SessionLocal
from app.models import User, UserRole, BuyerProfile, Company, ServiceProvider, CompanyActivity, Quotation, QuotationCategory, QuotationStatus
from datetime import datetime, timedelta

def populate_database():
    db = SessionLocal()
    try:
        print("🚀 Populando banco de dados...\n")

        password = "Teste123"

        print("1️⃣ Criando usuário produtor/comprador...")
        user_buyer = User(
            email="produtor@teste.com",
            password_hash=get_password_hash(password),
            role=UserRole.BUYER,
            nickname="João Produtor",
            email_verificado=True
        )
        db.add(user_buyer)
        db.flush()

        buyer_profile = BuyerProfile(
            user_id=user_buyer.id,
            nome_completo="João da Silva Produtor",
            cpf="12345678901",
            endereco="Fazenda Santa Rosa, KM 15",
            bairro="Zona Rural",
            cep="79000000",
            cidade="Campo Grande",
            estado="MS",
        )
        db.add(buyer_profile)
        print(f"   ✅ Produtor criado: {user_buyer.email}")

        print("\n2️⃣ Criando usuário vendedor 1...")
        user_seller1 = User(
            email="vendedor1@teste.com",
            password_hash=get_password_hash(password),
            role=UserRole.SELLER,
            nickname="Agropecuária Silva",
            email_verificado=True
        )
        db.add(user_seller1)
        db.flush()

        company1 = Company(
            user_id=user_seller1.id,
            nome_propriedade="Agropecuária Silva LTDA",
            cnpj_cpf="12345678000190",
            insc_est_identidade="123456789",
            endereco="Av. Brasil, 1000",
            bairro="Centro",
            cep="79000000",
            cidade="Dourados",
            estado="MS",
            email="contato@agrosilva.com.br",
        )
        db.add(company1)
        db.flush()
        print(f"   ✅ Vendedor criado: {user_seller1.email}")

        print("\n3️⃣ Criando usuário vendedor 2...")
        user_seller2 = User(
            email="vendedor2@teste.com",
            password_hash=get_password_hash(password),
            role=UserRole.SELLER,
            nickname="Fazenda Bom Futuro",
            email_verificado=True
        )
        db.add(user_seller2)
        db.flush()

        company2 = Company(
            user_id=user_seller2.id,
            nome_propriedade="Fazenda Bom Futuro",
            cnpj_cpf="98765432000100",
            insc_est_identidade="987654321",
            endereco="Rodovia MS-156, KM 20",
            bairro="Zona Rural",
            cep="79500000",
            cidade="Aquidauana",
            estado="MS",
            email="contato@bomfuturo.com.br",
        )
        db.add(company2)
        db.flush()

        service2 = ServiceProvider(
            user_id=user_seller2.id,
            nome_servico="Fazenda Bom Futuro",
            descricao="Venda de gado nelore de qualidade",
            email_contato="contato@bomfuturo.com.br",
            cidade="Aquidauana",
            estado="MS",
            tipo_servico="Venda de Gado",
        )
        db.add(service2)
        print(f"   ✅ Vendedor criado: {user_seller2.email}")

        print("\n4️⃣ Criando cotações...")

        quotation1 = Quotation(
            seller_id=user_seller1.id,
            seller_type="seller",
            title="Soja de Alta Qualidade",
            description="Soja livre de transgênicos, cultivada de forma sustentável.",
            category=QuotationCategory.AGRICULTURE,
            product_type="Grãos",
            location_city="Dourados",
            location_state="MS",
            price=145.50,
            quantity=5000,
            unit="kg",
            expires_at=datetime.now() + timedelta(days=30),
            free_shipping=False,
            discount_percentage=10,
            installments=3,
            stock=5000,
            status=QuotationStatus.ACTIVE,
        )
        db.add(quotation1)

        quotation2 = Quotation(
            seller_id=user_seller2.id,
            seller_type="seller",
            title="Gado Nelore Para Engorda",
            description="Lote de 50 cabeças de gado Nelore, idade entre 18-24 meses.",
            category=QuotationCategory.LIVESTOCK,
            product_type="Bovinos",
            location_city="Aquidauana",
            location_state="MS",
            price=8500.00,
            quantity=50,
            unit="cabeça",
            expires_at=datetime.now() + timedelta(days=20),
            free_shipping=False,
            stock=50,
            status=QuotationStatus.ACTIVE,
        )
        db.add(quotation2)

        quotation3 = Quotation(
            seller_id=user_seller1.id,
            seller_type="seller",
            title="Fertilizante Orgânico",
            description="Adubo orgânico de alta qualidade, rico em nutrientes.",
            category=QuotationCategory.AGRICULTURE,
            product_type="Insumos",
            location_city="Dourados",
            location_state="MS",
            price=45.00,
            quantity=2000,
            unit="kg",
            expires_at=datetime.now() + timedelta(days=60),
            free_shipping=False,
            discount_percentage=15,
            installments=5,
            stock=2000,
            status=QuotationStatus.ACTIVE,
        )
        db.add(quotation3)

        print("   ✅ 3 cotações criadas")

        db.commit()

        print("\n✅ Banco de dados populado com sucesso!")
        print("\n📋 Resumo:")
        print(f"   • 3 usuários criados")
        print(f"   • 2 empresas criadas")
        print(f"   • 3 cotações criadas")
        print("\n🔐 Credenciais:")
        print(f"   Produtor: produtor@teste.com / {password}")
        print(f"   Vendedor 1: vendedor1@teste.com / {password}")
        print(f"   Vendedor 2: vendedor2@teste.com / {password}")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Erro: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    populate_database()
