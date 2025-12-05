"""
Script para analisar relações entre perfis e matches de ofertas/cotações
Uso: python -m app.scripts.analyze_profile_relations
"""

import sys
from pathlib import Path

# Adiciona o diretório raiz ao path
root_dir = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(root_dir))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.quotation import Quotation, QuotationType, QuotationCategory
from app.models.user import User
from app.models.company import Company
from app.models.buyer_profile import BuyerProfile
from app.models.service_provider import ServiceProvider

def get_user_profiles(db: Session, user_id: int) -> list[str]:
    """Retorna lista de perfis do usuário"""
    profiles = []
    
    buyer = db.query(BuyerProfile).filter(BuyerProfile.user_id == user_id).first()
    company = db.query(Company).filter(Company.user_id == user_id).first()
    service = db.query(ServiceProvider).filter(ServiceProvider.user_id == user_id).first()
    
    if buyer:
        profiles.append("Produtor")
    if company:
        profiles.append("Fornecedor")
    if service:
        profiles.append("Prestador")
    
    return profiles

def get_profile_string(db: Session, user_id: int) -> str:
    """Retorna string do perfil do usuário"""
    profiles = get_user_profiles(db, user_id)
    return " + ".join(profiles) if profiles else "Sem perfil"

def main():
    db = SessionLocal()
    
    try:
        print("=" * 100)
        print("📊 ANÁLISE DE RELAÇÕES ENTRE PERFIS - OFERTAS E COTAÇÕES")
        print("=" * 100)
        print()
        
        # Busca todos os usuários
        users = db.query(User).order_by(User.email).all()
        
        # Agrupa por tipo de perfil
        profile_groups = {}
        
        for user in users:
            profile_str = get_profile_string(db, user.id)
            if profile_str not in profile_groups:
                profile_groups[profile_str] = []
            profile_groups[profile_str].append(user)
        
        print("📋 PERFIS ENCONTRADOS:")
        print("-" * 100)
        for profile, user_list in sorted(profile_groups.items()):
            print(f"   {profile}: {len(user_list)} usuários")
        print()
        
        # Analisa ofertas e cotações por perfil
        print("=" * 100)
        print("🔍 ANÁLISE DETALHADA POR PERFIL")
        print("=" * 100)
        print()
        
        for profile_type, user_list in sorted(profile_groups.items()):
            print(f"📌 PERFIL: {profile_type}")
            print("-" * 100)
            
            for user in user_list:
                # Busca ofertas criadas pelo usuário
                offers = db.query(Quotation).filter(
                    Quotation.seller_id == user.id,
                    Quotation.type == QuotationType.OFFER.value
                ).all()
                
                # Busca cotações criadas pelo usuário
                quotations = db.query(Quotation).filter(
                    Quotation.buyer_id == user.id,
                    Quotation.type == QuotationType.QUOTATION.value
                ).all()
                
                print(f"\n   👤 {user.email} ({user.nickname})")
                print(f"      • Ofertas criadas: {len(offers)}")
                print(f"      • Cotações criadas: {len(quotations)}")
                
                if offers:
                    print(f"\n      📦 OFERTAS CRIADAS:")
                    for offer in offers[:3]:  # Mostra até 3
                        print(f"         - {offer.title}")
                        print(f"           Categoria: {offer.category.value} | Produto: {offer.product_type or 'N/A'}")
                
                if quotations:
                    print(f"\n      📋 COTAÇÕES CRIADAS:")
                    for quot in quotations[:3]:  # Mostra até 3
                        print(f"         - {quot.title}")
                        print(f"           Categoria: {quot.category.value} | Produto: {quot.product_type or 'N/A'}")
                
                # Quem pode ver as ofertas deste usuário?
                if offers:
                    print(f"\n      👀 QUEM PODE VER AS OFERTAS DESTE USUÁRIO:")
                    print(f"         (Usuários com cotações compatíveis)")
                    
                    # Busca cotações de outros usuários que podem ver essas ofertas
                    matching_quotations = []
                    for offer in offers:
                        # Busca cotações com mesma categoria ou produto similar
                        compatible_quotations = db.query(Quotation).filter(
                            Quotation.buyer_id != user.id,  # Exclui o próprio usuário
                            Quotation.type == QuotationType.QUOTATION.value,
                            Quotation.category == offer.category
                        ).all()
                        
                        for quot in compatible_quotations:
                            quot_user = db.query(User).filter(User.id == quot.buyer_id).first()
                            if quot_user:
                                quot_profile = get_profile_string(db, quot_user.id)
                                matching_quotations.append({
                                    'user': quot_user,
                                    'profile': quot_profile,
                                    'quotation': quot,
                                    'offer': offer
                                })
                    
                    # Agrupa por perfil
                    matches_by_profile = {}
                    for match in matching_quotations:
                        profile_key = match['profile']
                        if profile_key not in matches_by_profile:
                            matches_by_profile[profile_key] = []
                        matches_by_profile[profile_key].append(match)
                    
                    if matches_by_profile:
                        for profile_key, matches in sorted(matches_by_profile.items()):
                            unique_users = set(m['user'].email for m in matches)
                            print(f"         • {profile_key}: {len(unique_users)} usuário(s) podem ver")
                            for email in sorted(unique_users)[:3]:  # Mostra até 3
                                print(f"           - {email}")
                    else:
                        print(f"         • Nenhum match encontrado no momento")
                
                # Quem pode ver as cotações deste usuário?
                if quotations:
                    print(f"\n      👀 QUEM PODE VER AS COTAÇÕES DESTE USUÁRIO:")
                    print(f"         (Usuários com ofertas compatíveis)")
                    
                    # Busca ofertas de outros usuários que podem atender essas cotações
                    matching_offers = []
                    for quot in quotations:
                        # Busca ofertas com mesma categoria ou produto similar
                        compatible_offers = db.query(Quotation).filter(
                            Quotation.seller_id != user.id,  # Exclui o próprio usuário
                            Quotation.type == QuotationType.OFFER.value,
                            Quotation.category == quot.category
                        ).all()
                        
                        for offer in compatible_offers:
                            offer_user = db.query(User).filter(User.id == offer.seller_id).first()
                            if offer_user:
                                offer_profile = get_profile_string(db, offer_user.id)
                                matching_offers.append({
                                    'user': offer_user,
                                    'profile': offer_profile,
                                    'offer': offer,
                                    'quotation': quot
                                })
                    
                    # Agrupa por perfil
                    matches_by_profile = {}
                    for match in matching_offers:
                        profile_key = match['profile']
                        if profile_key not in matches_by_profile:
                            matches_by_profile[profile_key] = []
                        matches_by_profile[profile_key].append(match)
                    
                    if matches_by_profile:
                        for profile_key, matches in sorted(matches_by_profile.items()):
                            unique_users = set(m['user'].email for m in matches)
                            print(f"         • {profile_key}: {len(unique_users)} usuário(s) podem atender")
                            for email in sorted(unique_users)[:3]:  # Mostra até 3
                                print(f"           - {email}")
                    else:
                        print(f"         • Nenhum match encontrado no momento")
                
                print()
            
            print()
        
        # Resumo de matches possíveis
        print("=" * 100)
        print("📈 RESUMO DE MATCHES POSSÍVEIS")
        print("=" * 100)
        print()
        
        print("🎯 REGRAS DE MATCHING:")
        print("   1. Ofertas são mostradas para usuários que têm cotações compatíveis")
        print("   2. Cotações são mostradas para usuários que têm ofertas compatíveis")
        print("   3. Compatibilidade baseada em:")
        print("      - Categoria (agriculture, livestock, service, both)")
        print("      - Tipo de produto (quando especificado)")
        print("      - Perfil do usuário (atividades, localização)")
        print()
        
        print("📊 MATRIZ DE COMPATIBILIDADE:")
        print("-" * 100)
        print("   Produtor (com cotação) → Vê ofertas de: Fornecedor, Produtor+Fornecedor, Prestador")
        print("   Fornecedor (com oferta) → Vê cotações de: Produtor, Produtor+Fornecedor")
        print("   Prestador (com oferta) → Vê cotações de: Produtor, Produtor+Prestador")
        print("   Produtor+Fornecedor → Vê ofertas (como produtor) e cotações (como fornecedor)")
        print("   Produtor+Prestador → Vê ofertas (como produtor) e cotações (como prestador)")
        print()
        
        print("=" * 100)
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    main()

