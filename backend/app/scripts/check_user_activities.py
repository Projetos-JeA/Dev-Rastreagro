"""Script para verificar atividades do usuário jeferson.greenish"""
import sys
from pathlib import Path

root_dir = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(root_dir))

from app.database import SessionLocal
from app.repositories.user_repository import UserRepository
from app.repositories.company_repository import CompanyRepository

db = SessionLocal()
try:
    user_repo = UserRepository(db)
    company_repo = CompanyRepository(db)
    
    # Busca o usuário
    user = user_repo.get_by_email("jeferson.greenish@gmail.com")
    
    if not user:
        print("❌ Usuário jeferson.greenish@gmail.com não encontrado")
    else:
        print(f"✅ Usuário encontrado: {user.email} (ID: {user.id})")
        print(f"   Role: {user.role.value}")
        print(f"   Nickname: {user.nickname}")
        
        # Verifica se tem company (produtor)
        company = company_repo.get_by_user_id(user.id)
        
        if company:
            print(f"\n🏢 Empresa encontrada: {company.nome_propriedade}")
            print(f"   CNPJ/CPF: {company.cnpj_cpf}")
            print(f"   Cidade: {company.cidade}, {company.estado}")
            
            # Verifica atividades
            if company.activities:
                print(f"\n📋 Atividades cadastradas ({len(company.activities)}):")
                for i, activity in enumerate(company.activities, 1):
                    category_name = activity.category.name if activity.category else "N/A"
                    group_name = activity.group.name if activity.group else "N/A"
                    item_name = activity.item.name if activity.item else "N/A"
                    print(f"   {i}. Categoria: {category_name}")
                    if activity.group:
                        print(f"      Grupo: {group_name}")
                    if activity.item:
                        print(f"      Item: {item_name}")
            else:
                print("\n⚠️  NENHUMA ATIVIDADE CADASTRADA!")
                print("   O filtro de cotações não funcionará corretamente.")
                print("   É necessário cadastrar atividades na empresa.")
        else:
            print("\n⚠️  Usuário não tem perfil de produtor (company)")
            print("   O filtro retornará todas as cotações (fallback)")
            
finally:
    db.close()

