"""Script para limpar completamente o banco de dados"""

import sys
from pathlib import Path

# Adiciona o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.database import SessionLocal
from app.models.user_interaction import UserInteraction
from app.models.match import Match
from app.models.quotation import Quotation
from app.models.company import Company, CompanyActivity
from app.models.buyer_profile import BuyerProfile
from app.models.service_provider import ServiceProvider
from app.models.email_verification_token import EmailVerificationToken
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User

def clean_database():
    db = SessionLocal()
    try:
        print("🧹 Iniciando limpeza do banco de dados...\n")
        
        # Conta registros antes
        user_count = db.query(User).count()
        company_count = db.query(Company).count()
        quotation_count = db.query(Quotation).count()
        match_count = db.query(Match).count()
        interaction_count = db.query(UserInteraction).count()
        
        print(f"📊 Registros encontrados:")
        print(f"   • Usuários: {user_count}")
        print(f"   • Empresas: {company_count}")
        print(f"   • Cotações: {quotation_count}")
        print(f"   • Matches: {match_count}")
        print(f"   • Interações: {interaction_count}\n")
        
        if user_count == 0:
            print("✅ Banco de dados já está vazio!")
            return
        
        # Confirmação
        print("⚠️  ATENÇÃO: Esta operação vai DELETAR TODOS os dados!")
        print("   • Todos os usuários")
        print("   • Todas as empresas")
        print("   • Todas as cotações")
        print("   • Todos os matches")
        print("   • Todas as interações")
        print("   • Todos os tokens de verificação\n")
        
        resposta = input("Deseja continuar? (digite 'SIM' para confirmar): ")
        if resposta.upper() != "SIM":
            print("❌ Operação cancelada.")
            return
        
        print("\n🗑️  Deletando registros...\n")
        
        # Deleta na ordem correta (respeitando foreign keys)
        # 1. Interações (dependem de user e quotation)
        deleted_interactions = db.query(UserInteraction).delete()
        print(f"   ✅ {deleted_interactions} interações deletadas")
        
        # 2. Matches (dependem de user e quotation)
        deleted_matches = db.query(Match).delete()
        print(f"   ✅ {deleted_matches} matches deletados")
        
        # 3. Cotações (dependem de user)
        deleted_quotations = db.query(Quotation).delete()
        print(f"   ✅ {deleted_quotations} cotações deletadas")
        
        # 4. Company Activities (dependem de company)
        deleted_activities = db.query(CompanyActivity).delete()
        print(f"   ✅ {deleted_activities} atividades de empresas deletadas")
        
        # 5. Companies (dependem de user)
        deleted_companies = db.query(Company).delete()
        print(f"   ✅ {deleted_companies} empresas deletadas")
        
        # 6. Service Providers (dependem de user)
        deleted_services = db.query(ServiceProvider).delete()
        print(f"   ✅ {deleted_services} prestadores de serviço deletados")
        
        # 7. Buyer Profiles (dependem de user)
        deleted_buyers = db.query(BuyerProfile).delete()
        print(f"   ✅ {deleted_buyers} perfis de comprador deletados")
        
        # 8. Tokens (dependem de user)
        deleted_email_tokens = db.query(EmailVerificationToken).delete()
        print(f"   ✅ {deleted_email_tokens} tokens de verificação deletados")
        
        deleted_password_tokens = db.query(PasswordResetToken).delete()
        print(f"   ✅ {deleted_password_tokens} tokens de reset de senha deletados")
        
        # 9. Users (último, pois outros dependem dele)
        deleted_users = db.query(User).delete()
        print(f"   ✅ {deleted_users} usuários deletados")
        
        # Commit
        db.commit()
        
        print(f"\n✅ Limpeza concluída com sucesso!")
        print(f"   Total deletado:")
        print(f"   • {deleted_users} usuários")
        print(f"   • {deleted_companies} empresas")
        print(f"   • {deleted_quotations} cotações")
        print(f"   • {deleted_matches} matches")
        print(f"   • {deleted_interactions} interações")
        print(f"\n💡 Banco de dados está limpo e pronto para novos cadastros!")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Erro ao limpar banco de dados: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    clean_database()

