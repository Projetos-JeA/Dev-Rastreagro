"""Script para verificar por que a IA não está fazendo match"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.database import SessionLocal
from app.repositories.user_repository import UserRepository
from app.repositories.buyer_profile_repository import BuyerProfileRepository
from app.repositories.company_repository import CompanyRepository
from app.repositories.quotation_repository import QuotationRepository
from app.services.ai.matching_service import MatchingService

def check_matching():
    db = SessionLocal()
    try:
        user_repo = UserRepository(db)
        buyer_repo = BuyerProfileRepository(db)
        company_repo = CompanyRepository(db)
        quotation_repo = QuotationRepository(db)
        
        # Busca produtor
        email = "produtor.teste@empresa.com"
        user = user_repo.get_by_email(email)
        
        if not user:
            print(f"❌ Usuário {email} não encontrado")
            return
        
        print(f"👤 Produtor: {user.email} (ID: {user.id})")
        
        # Verifica buyer_profile
        buyer_profile = buyer_repo.get_by_user_id(user.id)
        if buyer_profile:
            print(f"✅ Buyer Profile encontrado")
            print(f"   Cidade: {buyer_profile.cidade} / {buyer_profile.estado}")
        else:
            print(f"❌ Buyer Profile NÃO encontrado!")
        
        # Verifica company (para atividades)
        company = company_repo.get_by_user_id(user.id)
        if company:
            print(f"✅ Company encontrada")
            print(f"   Atividades: {len(company.activities)}")
            for activity in company.activities:
                if activity.category:
                    print(f"      - {activity.category.name}")
        else:
            print(f"⚠️  Company NÃO encontrada (produtor puro não tem atividades)")
        
        # Busca cotações
        quotations = quotation_repo.list_active(limit=100, offset=0)
        print(f"\n📦 Cotações disponíveis: {len(quotations)}")
        
        if not quotations:
            print(f"❌ Nenhuma cotação encontrada!")
            return
        
        # Testa matching
        print(f"\n🧠 Testando IA Matching...")
        matching_service = MatchingService(db)
        
        scores = []
        for quotation in quotations[:5]:  # Testa as primeiras 5
            try:
                score = matching_service.calculate_relevance_score(user.id, quotation)
                scores.append({
                    "quotation_id": quotation.id,
                    "title": quotation.title,
                    "category": quotation.category.value,
                    "score": score
                })
                print(f"   Cotação {quotation.id}: {quotation.title[:30]}... → Score: {score:.2f}")
            except Exception as e:
                print(f"   ❌ Erro ao calcular score para cotação {quotation.id}: {e}")
        
        if scores:
            print(f"\n📊 Scores calculados:")
            for s in sorted(scores, key=lambda x: x["score"], reverse=True):
                print(f"   • {s['title'][:40]} → {s['score']:.2f}")
        
        # Verifica se há scores altos
        high_scores = [s for s in scores if s["score"] >= 50]
        if not high_scores:
            print(f"\n⚠️  PROBLEMA: Nenhum score >= 50!")
            print(f"   A IA não está encontrando matches relevantes")
            print(f"   Possíveis causas:")
            print(f"   • Produtor não tem atividades cadastradas")
            print(f"   • Produtor não tem interações anteriores")
            print(f"   • Localização não bate")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_matching()

