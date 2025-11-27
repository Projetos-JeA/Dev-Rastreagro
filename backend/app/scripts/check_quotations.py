"""Script para verificar cotações no banco"""
from app.database import SessionLocal
from app.models.quotation import Quotation
from app.models.user import User

db = SessionLocal()
quotations = db.query(Quotation).all()
print(f'📊 Total de cotações no banco: {len(quotations)}')
print('\n📋 Cotações criadas:')
for q in quotations:
    seller = db.query(User).filter(User.id == q.seller_id).first()
    print(f'   • ID {q.id}: {q.title}')
    print(f'     Vendedor: {seller.nickname if seller else "N/A"}')
    print(f'     Categoria: {q.category.value}')
    print(f'     Preço: R$ {q.price}')
    print(f'     Status: {q.status.value}')
    print()
db.close()

