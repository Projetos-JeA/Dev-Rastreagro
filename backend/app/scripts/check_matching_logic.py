"""Script para verificar a lógica de matching"""
import sys
from pathlib import Path

root_dir = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(root_dir))

from app.database import SessionLocal
from app.repositories.user_repository import UserRepository
from app.repositories.company_repository import CompanyRepository
from app.repositories.quotation_repository import QuotationRepository
from app.models.quotation import QuotationCategory

db = SessionLocal()
try:
    user_repo = UserRepository(db)
    company_repo = CompanyRepository(db)
    quotation_repo = QuotationRepository(db)
    
    # Busca o usuário jeferson
    user = user_repo.get_by_email("jeferson.greenish@gmail.com")
    
    if not user:
        print("❌ Usuário não encontrado")
    else:
        print(f"✅ Usuário: {user.email} (ID: {user.id})")
        print(f"   Role: {user.role.value}")
        
        # Busca empresa
        company = company_repo.get_by_user_id(user.id)
        
        if company:
            print(f"\n🏢 Empresa: {company.nome_propriedade}")
            print(f"   Atividades cadastradas: {len(company.activities)}")
            
            # Lista atividades
            relevant_categories = set()
            for activity in company.activities:
                if activity.category:
                    category_name = activity.category.name.lower()
                    print(f"\n   📋 Atividade: {activity.category.name}")
                    
                    # Aplica a mesma lógica do código
                    if "pecuária" in category_name or "pecuaria" in category_name:
                        relevant_categories.add(QuotationCategory.LIVESTOCK)
                        relevant_categories.add(QuotationCategory.BOTH)
                        relevant_categories.add(QuotationCategory.AGRICULTURE)  # Ração, sal, sementes são úteis
                        print(f"      → Mapeia para: livestock, both, agriculture")
                    elif "agricultura" in category_name:
                        relevant_categories.add(QuotationCategory.AGRICULTURE)
                        relevant_categories.add(QuotationCategory.BOTH)
                        relevant_categories.add(QuotationCategory.LIVESTOCK)
                        print(f"      → Mapeia para: agriculture, both, livestock")
                    elif "integração" in category_name or "integracao" in category_name:
                        relevant_categories.add(QuotationCategory.BOTH)
                        relevant_categories.add(QuotationCategory.AGRICULTURE)
                        relevant_categories.add(QuotationCategory.LIVESTOCK)
                        relevant_categories.add(QuotationCategory.SERVICE)
                        print(f"      → Mapeia para: all categories")
                    elif "serviço" in category_name or "servico" in category_name:
                        relevant_categories.add(QuotationCategory.SERVICE)
                        relevant_categories.add(QuotationCategory.BOTH)
                        print(f"      → Mapeia para: service, both")
            
            print(f"\n📊 Categorias relevantes calculadas: {[c.value for c in relevant_categories]}")
            
            # Busca todas as cotações
            all_quotations = quotation_repo.list_active(100, 0)
            print(f"\n📦 Total de cotações no banco: {len(all_quotations)}")
            
            # Verifica cada cotação
            print(f"\n🔍 Análise de cada cotação:")
            for q in all_quotations:
                is_relevant = q.category in relevant_categories
                status = "✅ RELEVANTE" if is_relevant else "❌ NÃO RELEVANTE"
                print(f"\n   {status} - {q.title}")
                print(f"      Categoria: {q.category.value}")
                print(f"      Tipo: {q.product_type}")
                if not is_relevant:
                    print(f"      ⚠️  Por que aparece? Verificar lógica!")
            
            # Busca arame farpado especificamente
            arame = next((q for q in all_quotations if "arame" in q.title.lower() or "farpado" in q.title.lower()), None)
            if arame:
                print(f"\n🔍 ANÁLISE ESPECÍFICA: Arame Farpado")
                print(f"   Categoria: {arame.category.value}")
                print(f"   Está em relevant_categories? {arame.category in relevant_categories}")
                print(f"   Por que aparece:")
                if arame.category == QuotationCategory.AGRICULTURE:
                    print(f"      • Categoria é 'agriculture'")
                    print(f"      • Jeferson tem atividade 'Pecuária'")
                    print(f"      • Lógica atual: Pecuária → mostra agriculture (ração, sal, sementes)")
                    print(f"      • ⚠️  PROBLEMA: Arame não é essencial para pecuária como ração/sal")
                    print(f"      • 💡 SOLUÇÃO: Ajustar lógica para ser mais específica")
        else:
            print("\n⚠️  Usuário não tem empresa cadastrada")
            
finally:
    db.close()

