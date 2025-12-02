"""Script para testar envio de email diretamente (sem verificar usuário)"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.services.email_service import EmailService


async def test_email_direct(to_email: str):
    """Testa envio de email diretamente"""
    print("=" * 60)
    print("🧪 TESTE DIRETO DE ENVIO DE EMAIL")
    print("=" * 60)
    print(f"\n📧 Para: {to_email}\n")
    
    email_service = EmailService()
    
    # Verifica configuração
    if not email_service.emails:
        print("❌ Resend não está configurado!")
        print("   Verifique se RESEND_API_KEY está no .env")
        return False
    
    print("✅ Resend configurado")
    print(f"   Email de origem: {email_service.from_email}")
    
    # Gera token de teste
    token = email_service.generate_verification_token()
    print(f"\n🔑 Token gerado: {token}")
    
    # Testa envio de recuperação de senha
    print("\n📧 Enviando email de recuperação de senha...")
    try:
        await email_service.send_password_reset_email(to_email, token, "Teste")
        print("✅ Email enviado com sucesso!")
        print(f"\n🔗 URL de recuperação:")
        print(f"   {email_service.get_password_reset_url(token)}")
        print("\n💡 Verifique a caixa de entrada (e também a pasta de spam)")
        return True
    except Exception as e:
        print(f"❌ Erro ao enviar email: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else "rastreagro.br@gmail.com"
    
    print("\n🚀 Testando envio direto de email...\n")
    
    try:
        result = asyncio.run(test_email_direct(email))
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

