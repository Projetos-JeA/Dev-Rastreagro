"""
Script para criar cotações de teste vinculadas às empresas criadas
Uso: python -m app.scripts.create_test_quotations
"""

import sys
from pathlib import Path
from datetime import datetime, timedelta

# Adiciona o diretório raiz ao path
root_dir = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(root_dir))

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.quotation import Quotation, QuotationStatus, QuotationCategory
from app.repositories.user_repository import UserRepository
from app.repositories.company_repository import CompanyRepository


def create_test_quotations():
    """Cria cotações de teste para as empresas"""
    db: Session = SessionLocal()
    try:
        user_repo = UserRepository(db)
        company_repo = CompanyRepository(db)

        # Busca as empresas criadas anteriormente
        company1 = company_repo.get_by_cnpj_cpf("12.345.678/0001-90")  # Agropecuária Silva
        company2 = company_repo.get_by_cnpj_cpf("98.765.432/0001-10")  # Fazenda Verde

        if not company1 or not company2:
            print("❌ Empresas não encontradas. Execute primeiro: python -m app.scripts.create_test_companies")
            return

        user1 = user_repo.get_by_id(company1.user_id)
        user2 = user_repo.get_by_id(company2.user_id)

        print(f"✅ Empresa 1 encontrada: {company1.nome_propriedade} (User ID: {user1.id})")
        print(f"✅ Empresa 2 encontrada: {company2.nome_propriedade} (User ID: {user2.id})")

        # COTAÇÃO 1: Agropecuária Silva - Sementes de Capim Mombaça
        print("\n📦 Criando Cotação 1: Sementes de Capim Mombaça...")
        quotation1 = Quotation(
            seller_id=user1.id,
            seller_type="company",
            title="Sementes de CAPIM Mombaça - 20kg",
            description="Sementes de Capim Mombaça de alta qualidade e germinação. Ideal para formação e recuperação de pastagens. Germinação garantida de 85%, pureza de 98%.",
            category=QuotationCategory.AGRICULTURE,
            product_type="Sementes de Pastagem",
            location_city=company1.cidade,
            location_state=company1.estado,
            price=132.99,
            quantity=50,
            unit="kg",
            status=QuotationStatus.ACTIVE,
            expires_at=datetime.utcnow() + timedelta(days=30),
            image_url="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400",
            images='["https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400"]',
            free_shipping=True,
            discount_percentage=49,
            installments=12,
            stock=50,
        )
        db.add(quotation1)

        # COTAÇÃO 2: Agropecuária Silva - Touro Nelore
        print("📦 Criando Cotação 2: Touro Nelore Reprodutor...")
        quotation2 = Quotation(
            seller_id=user1.id,
            seller_type="company",
            title="Touro Nelore Reprodutor",
            description="Touro Nelore PO, 3 anos, excelente genética para reprodução. Certificado de registro ABCZ, vacinação em dia. Animal dócil e com ótimo histórico reprodutivo.",
            category=QuotationCategory.LIVESTOCK,
            product_type="Gado de Corte",
            location_city=company1.cidade,
            location_state=company1.estado,
            price=13299.90,
            quantity=1,
            unit="unidade",
            status=QuotationStatus.ACTIVE,
            expires_at=datetime.utcnow() + timedelta(days=15),
            image_url="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400",
            images='["https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400", "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400"]',
            free_shipping=False,
            discount_percentage=49,
            installments=12,
            stock=1,
        )
        db.add(quotation2)

        # COTAÇÃO 3: Fazenda Verde - Arame Farpado
        print("📦 Criando Cotação 3: Arame Farpado...")
        quotation3 = Quotation(
            seller_id=user2.id,
            seller_type="company",
            title="Arame Farpado Nelore - 500m",
            description="Arame farpado galvanizado de alta resistência, ideal para cercas de pasto. Produto novo com garantia. Bitola 2,4mm, 4 pontas.",
            category=QuotationCategory.AGRICULTURE,
            product_type="Insumos Agrícolas",
            location_city=company2.cidade,
            location_state=company2.estado,
            price=1329.99,
            quantity=15,
            unit="rolo",
            status=QuotationStatus.ACTIVE,
            expires_at=datetime.utcnow() + timedelta(days=45),
            image_url="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400",
            images='["https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400"]',
            free_shipping=True,
            discount_percentage=49,
            installments=12,
            stock=15,
        )
        db.add(quotation3)

        # COTAÇÃO 4: Fazenda Verde - Ração Premium
        print("📦 Criando Cotação 4: Ração Premium Bovinos...")
        quotation4 = Quotation(
            seller_id=user2.id,
            seller_type="company",
            title="Ração Premium Bovinos - 50kg",
            description="Ração balanceada premium para bovinos de corte e leite. Formulação completa com vitaminas e minerais. Proteína 18%, Energia 2.800 kcal/kg.",
            category=QuotationCategory.AGRICULTURE,
            product_type="Ração Animal",
            location_city=company2.cidade,
            location_state=company2.estado,
            price=675.00,
            quantity=120,
            unit="saco",
            status=QuotationStatus.ACTIVE,
            expires_at=datetime.utcnow() + timedelta(days=60),
            image_url="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400",
            images='["https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400"]',
            free_shipping=True,
            discount_percentage=24,
            installments=6,
            stock=120,
        )
        db.add(quotation4)

        # COTAÇÃO 5: Agropecuária Silva - Sal Mineral
        print("📦 Criando Cotação 5: Sal Mineral Premium...")
        quotation5 = Quotation(
            seller_id=user1.id,
            seller_type="company",
            title="Sal Mineral Premium - 25kg",
            description="Sal mineral enriquecido para bovinos, formulação balanceada com macro e microelementos essenciais. Cálcio 120g/kg, Fósforo 90g/kg. Tipo seca das águas.",
            category=QuotationCategory.AGRICULTURE,
            product_type="Suplemento Animal",
            location_city=company1.cidade,
            location_state=company1.estado,
            price=99.99,
            quantity=35,
            unit="saco",
            status=QuotationStatus.ACTIVE,
            expires_at=datetime.utcnow() + timedelta(days=20),
            image_url="https://images.unsplash.com/photo-1628243323838-f3876b5f9877?w=400",
            images='["https://images.unsplash.com/photo-1628243323838-f3876b5f9877?w=400"]',
            free_shipping=True,
            discount_percentage=20,
            installments=3,
            stock=35,
        )
        db.add(quotation5)

        # COTAÇÃO 6: Fazenda Verde - Pulverizador
        print("📦 Criando Cotação 6: Pulverizador Costal...")
        quotation6 = Quotation(
            seller_id=user2.id,
            seller_type="company",
            title="Pulverizador Costal 20L",
            description="Pulverizador costal manual 20L com bomba de pressão, ideal para aplicação de defensivos e fertilizantes. Material plástico reforçado, pressão até 4 bar, garantia 12 meses.",
            category=QuotationCategory.SERVICE,
            product_type="Equipamento Agrícola",
            location_city=company2.cidade,
            location_state=company2.estado,
            price=325.00,
            quantity=8,
            unit="unidade",
            status=QuotationStatus.ACTIVE,
            expires_at=datetime.utcnow() + timedelta(days=25),
            image_url="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400",
            images='["https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400"]',
            free_shipping=False,
            discount_percentage=28,
            installments=10,
            stock=8,
        )
        db.add(quotation6)

        db.commit()

        print("\n✅ Cotações criadas com sucesso!")
        print(f"\n📋 Resumo:")
        print(f"   • Empresa 1 ({company1.nome_propriedade}): 3 cotações")
        print(f"   • Empresa 2 ({company2.nome_propriedade}): 3 cotações")
        print(f"   • Total: 6 cotações ativas")
        print(f"\n💡 Próximos passos:")
        print(f"   • Testar GET /quotations no Swagger")
        print(f"   • Verificar se aparecem para o produtor jeferson.greenish")

    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao criar cotações: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    create_test_quotations()

