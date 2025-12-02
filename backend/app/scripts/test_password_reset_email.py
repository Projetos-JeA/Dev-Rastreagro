"""Script para testar envio de email de recuperação de senha"""

import asyncio
import sys
from pathlib import Path

# Adiciona o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.database import SessionLocal
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.services.email_service import EmailService


async def test_password_reset_email(email: str):
    """Testa envio de email de recuperação de senha"""
    print("=" * 60)
    print("🧪 TESTE DE RECUPERAÇÃO DE SENHA")
    print("=" * 60)
    print(f"\n📧 Email: {email}\n")
    
    # Conecta ao banco
    db = SessionLocal()
    try:
        user_repo = UserRepository(db)
        auth_service = AuthService(db)
        email_service = EmailService()
        
        # Verifica se usuário existe
        print("🔍 Verificando se usuário existe...")
        user = user_repo.get_by_email(email)
        
        if not user:
            print(f"❌ Usuário com email '{email}' não encontrado!")
            print("\n💡 Verifique se o email está correto ou crie o usuário primeiro.")
            return False
        
        print(f"✅ Usuário encontrado:")
        print(f"   ID: {user.id}")
        print(f"   Email: {user.email}")
        print(f"   Role: {user.role.value}")
        print(f"   Email verificado: {'✅ Sim' if user.email_verificado else '❌ Não'}")
        
        # Verifica configuração do Resend
        print("\n🔍 Verificando configuração do Resend...")
        if not email_service.emails:
            print("❌ Resend não está configurado!")
            print("   Verifique se RESEND_API_KEY está no .env")
            return False
        
        print("✅ Resend configurado")
        print(f"   Email de origem: {email_service.from_email}")
        
        # Testa envio de email
        print("\n📧 Enviando email de recuperação de senha...")
        try:
            await auth_service.request_password_reset(email)
            print("✅ Email de recuperação enviado com sucesso!")
            print("\n💡 Verifique a caixa de entrada do email (e também a pasta de spam)")
            
            # Busca o token criado
            from app.repositories.password_reset_repository import PasswordResetTokenRepository
            password_reset_repo = PasswordResetTokenRepository(db)
            reset_token = password_reset_repo.get_by_user_id(user.id)
            
            if reset_token:
                reset_url = email_service.get_password_reset_url(reset_token.token)
                print(f"\n🔗 URL de recuperação gerada:")
                print(f"   {reset_url}")
                print(f"\n🔑 Token: {reset_token.token}")
                print(f"⏰ Expira em: {reset_token.expires_at}")
            
            return True
            
        except Exception as e:
            print(f"❌ Erro ao enviar email: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
            
    finally:
        db.close()


if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else "jeferson.greenish@gmail.com"
    
    print("\n🚀 Iniciando teste de recuperação de senha...\n")
    
    try:
        result = asyncio.run(test_password_reset_email(email))
        if result:
            print("\n" + "=" * 60)
            print("✅ TESTE CONCLUÍDO COM SUCESSO")
            print("=" * 60)
        else:
            print("\n" + "=" * 60)
            print("❌ TESTE FALHOU")
            print("=" * 60)
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n⚠️ Teste cancelado pelo usuário")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Erro inesperado: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

