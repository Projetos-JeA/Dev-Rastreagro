"""
Script para verificar quais perfis têm cotações e ofertas criadas
Uso: python -m app.scripts.check_quotations_and_offers
"""

import sys
from pathlib import Path

# Adiciona o diretório raiz ao path
root_dir = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(root_dir))

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import SessionLocal
from app.models.quotation import Quotation, QuotationType
from app.models.user import User
from app.models.company import Company
from app.models.buyer_profile import BuyerProfile
from app.models.service_provider import ServiceProvider
from app.repositories.user_repository import UserRepository

def main():
    db = SessionLocal()
    
    try:
        print("=" * 80)
        print("📊 RELATÓRIO DE COTAÇÕES E OFERTAS POR PERFIL")
        print("=" * 80)
        print()
        
        # Busca todos os usuários
        users = db.query(User).order_by(User.email).all()
        
        usuarios_com_cotacoes = []
        usuarios_com_ofertas = []
        usuarios_sem_nada = []
        
        for user in users:
            # Verifica perfis
            buyer = db.query(BuyerProfile).filter(BuyerProfile.user_id == user.id).first()
            company = db.query(Company).filter(Company.user_id == user.id).first()
            service = db.query(ServiceProvider).filter(ServiceProvider.user_id == user.id).first()
            
            perfis = []
            if buyer:
                perfis.append("Produtor")
            if company:
                perfis.append("Fornecedor")
            if service:
                perfis.append("Prestador")
            
            perfil_str = " + ".join(perfis) if perfis else "Sem perfil"
            
            # Conta cotações
            cotacoes = db.query(Quotation).filter(
                Quotation.buyer_id == user.id,
                Quotation.type == QuotationType.QUOTATION.value
            ).count()
            
            # Conta ofertas
            ofertas = db.query(Quotation).filter(
                Quotation.seller_id == user.id,
                Quotation.type == QuotationType.OFFER.value
            ).count()
            
            if cotacoes > 0:
                usuarios_com_cotacoes.append({
                    "email": user.email,
                    "nickname": user.nickname,
                    "perfil": perfil_str,
                    "cotacoes": cotacoes,
                    "ofertas": ofertas
                })
            
            if ofertas > 0:
                usuarios_com_ofertas.append({
                    "email": user.email,
                    "nickname": user.nickname,
                    "perfil": perfil_str,
                    "cotacoes": cotacoes,
                    "ofertas": ofertas
                })
            
            if cotacoes == 0 and ofertas == 0:
                usuarios_sem_nada.append({
                    "email": user.email,
                    "nickname": user.nickname,
                    "perfil": perfil_str
                })
        
        # Exibe relatório
        print("📋 USUÁRIOS COM COTAÇÕES CRIADAS:")
        print("-" * 80)
        if usuarios_com_cotacoes:
            for u in usuarios_com_cotacoes:
                print(f"   • {u['email']} ({u['nickname']})")
                print(f"     Perfil: {u['perfil']}")
                print(f"     Cotações: {u['cotacoes']} | Ofertas: {u['ofertas']}")
                print()
        else:
            print("   Nenhum usuário com cotações criadas")
        print()
        
        print("📦 USUÁRIOS COM OFERTAS CRIADAS:")
        print("-" * 80)
        if usuarios_com_ofertas:
            for u in usuarios_com_ofertas:
                print(f"   • {u['email']} ({u['nickname']})")
                print(f"     Perfil: {u['perfil']}")
                print(f"     Cotações: {u['cotacoes']} | Ofertas: {u['ofertas']}")
                print()
        else:
            print("   Nenhum usuário com ofertas criadas")
        print()
        
        print("📊 RESUMO:")
        print("-" * 80)
        print(f"   Total de usuários: {len(users)}")
        print(f"   Usuários com cotações: {len(usuarios_com_cotacoes)}")
        print(f"   Usuários com ofertas: {len(usuarios_com_ofertas)}")
        print(f"   Usuários sem cotações nem ofertas: {len(usuarios_sem_nada)}")
        print()
        
        # Estatísticas por tipo de perfil
        print("📈 ESTATÍSTICAS POR TIPO DE PERFIL:")
        print("-" * 80)
        
        perfis_stats = {}
        for u in usuarios_com_cotacoes + usuarios_com_ofertas:
            perfil_key = u['perfil']
            if perfil_key not in perfis_stats:
                perfis_stats[perfil_key] = {"cotacoes": 0, "ofertas": 0, "usuarios": set()}
            perfis_stats[perfil_key]["cotacoes"] += u['cotacoes']
            perfis_stats[perfil_key]["ofertas"] += u['ofertas']
            perfis_stats[perfil_key]["usuarios"].add(u['email'])
        
        for perfil, stats in sorted(perfis_stats.items()):
            print(f"   {perfil}:")
            print(f"     Usuários: {len(stats['usuarios'])}")
            print(f"     Total de cotações: {stats['cotacoes']}")
            print(f"     Total de ofertas: {stats['ofertas']}")
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

