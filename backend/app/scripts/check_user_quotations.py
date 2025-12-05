"""
Script para verificar cotações e ofertas de um usuário específico
Uso: python -m app.scripts.check_user_quotations produtor_cpf1@teste.com
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

def main():
    if len(sys.argv) < 2:
        print("Uso: python -m app.scripts.check_user_quotations <email>")
        sys.exit(1)
    
    email = sys.argv[1]
    db = SessionLocal()
    
    try:
        print("=" * 80)
        print(f"🔍 VERIFICANDO COTAÇÕES E OFERTAS PARA: {email}")
        print("=" * 80)
        print()
        
        # Busca o usuário
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ Usuário não encontrado: {email}")
            return
        
        print(f"✅ Usuário encontrado:")
        print(f"   ID: {user.id}")
        print(f"   Email: {user.email}")
        print(f"   Nickname: {user.nickname}")
        print()
        
        # Busca cotações (type = QUOTATION, buyer_id = user.id)
        quotations = db.query(Quotation).filter(
            Quotation.buyer_id == user.id,
            Quotation.type == QuotationType.QUOTATION.value
        ).all()
        
        print(f"📋 COTAÇÕES (type=QUOTATION, buyer_id={user.id}):")
        print(f"   Total: {len(quotations)}")
        for q in quotations:
            print(f"   • ID: {q.id} | Título: {q.title} | Status: {q.status}")
            print(f"     buyer_id: {q.buyer_id} | seller_id: {q.seller_id}")
            print(f"     type: {q.type}")
        print()
        
        # Busca ofertas (type = OFFER, seller_id = user.id)
        offers = db.query(Quotation).filter(
            Quotation.seller_id == user.id,
            Quotation.type == QuotationType.OFFER.value
        ).all()
        
        print(f"📦 OFERTAS (type=OFFER, seller_id={user.id}):")
        print(f"   Total: {len(offers)}")
        for o in offers:
            print(f"   • ID: {o.id} | Título: {o.title} | Status: {o.status}")
            print(f"     buyer_id: {o.buyer_id} | seller_id: {o.seller_id}")
            print(f"     type: {o.type}")
        print()
        
        # Busca TODAS as cotações relacionadas ao usuário (qualquer tipo)
        all_related = db.query(Quotation).filter(
            (Quotation.buyer_id == user.id) | (Quotation.seller_id == user.id)
        ).all()
        
        print(f"🔗 TODAS AS COTAÇÕES/OFERTAS RELACIONADAS:")
        print(f"   Total: {len(all_related)}")
        for item in all_related:
            print(f"   • ID: {item.id} | Título: {item.title}")
            print(f"     type: {item.type} | buyer_id: {item.buyer_id} | seller_id: {item.seller_id}")
        print()
        
        print("=" * 80)
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    main()

