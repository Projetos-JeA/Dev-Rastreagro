"""
Script para testar o cálculo de score
Uso: python -m app.scripts.test_score_calculation produtor_cpf1@teste.com
"""

import sys
from pathlib import Path

# Adiciona o diretório raiz ao path
root_dir = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(root_dir))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.quotation import Quotation, QuotationType
from app.models.user import User
from app.services.quotation_service import QuotationService

def main():
    if len(sys.argv) < 2:
        print("Uso: python -m app.scripts.test_score_calculation <email>")
        sys.exit(1)
    
    email = sys.argv[1]
    db = SessionLocal()
    
    try:
        print("=" * 80)
        print(f"🧪 TESTANDO CÁLCULO DE SCORE PARA: {email}")
        print("=" * 80)
        print()
        
        # Busca o usuário
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ Usuário não encontrado: {email}")
            return
        
        print(f"✅ Usuário encontrado: {user.email} (ID: {user.id})")
        print()
        
        # Busca cotações do usuário
        quotations = db.query(Quotation).filter(
            Quotation.buyer_id == user.id,
            Quotation.type == QuotationType.QUOTATION.value
        ).all()
        
        print(f"📋 Cotações do usuário: {len(quotations)}")
        for q in quotations:
            print(f"   • {q.title} | Categoria: {q.category.value} | Produto: {q.product_type}")
        print()
        
        # Busca ofertas de outros
        offers = db.query(Quotation).filter(
            Quotation.type == QuotationType.OFFER.value,
            Quotation.seller_id != user.id
        ).all()
        
        print(f"📦 Ofertas de outros usuários: {len(offers)}")
        print()
        
        # Testa o serviço
        service = QuotationService(db)
        relevant = service.get_relevant_quotations(user.id, limit=20)
        
        print(f"✅ Resultado do get_relevant_quotations: {len(relevant)} itens")
        for i, item in enumerate(relevant[:10], 1):
            print(f"   {i}. {item.title} | Categoria: {item.category.value} | Produto: {item.product_type} | Seller: {item.seller_id}")
        print()
        
        if len(relevant) == 0:
            print("⚠️ PROBLEMA: Nenhum resultado retornado!")
            print("   Verifique os logs do backend para mais detalhes.")
        else:
            print("✅ Resultados encontrados! O problema pode estar no frontend.")
        
        print("=" * 80)
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    main()

