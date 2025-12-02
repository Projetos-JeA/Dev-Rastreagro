"""Service para envio de emails usando Resend"""

import uuid
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status

from app.core.config import get_settings

settings = get_settings()

# Importa Resend apenas se a chave estiver configurada
try:
    import resend
    from resend import Emails
    RESEND_AVAILABLE = bool(settings.resend_api_key)
except ImportError:
    RESEND_AVAILABLE = False
    resend = None
    Emails = None


class EmailService:
    """Service para envio de emails de verificação usando Resend"""

    def __init__(self):
        if RESEND_AVAILABLE and settings.resend_api_key:
            resend.api_key = settings.resend_api_key
            self.emails = Emails()
            self.from_email = settings.resend_from_email
        else:
            self.emails = None
            self.from_email = None

    def generate_verification_token(self) -> str:
        """Gera um token único para verificação de email"""
        return str(uuid.uuid4())

    def get_verification_url(self, token: str) -> str:
        """Retorna a URL de verificação para um token"""
        return f"{settings.frontend_url}/verify-email?token={token}"

    def get_password_reset_url(self, token: str) -> str:
        """Retorna a URL de recuperação de senha para um token"""
        return f"{settings.frontend_url}/reset-password?token={token}"

    async def send_verification_email(
        self, email: str, token: str, user_name: str = ""
    ) -> bool:
        """
        Envia email de verificação usando Resend
        
        Args:
            email: Email do destinatário
            token: Token de verificação
            user_name: Nome do usuário (opcional)
            
        Returns:
            bool: True se enviado com sucesso, False caso contrário
            
        Raises:
            HTTPException: Se Resend não estiver configurado ou houver erro
        """
        if not self.emails:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Serviço de email não configurado. Configure RESEND_API_KEY no .env"
            )

        verification_url = f"{settings.frontend_url}/verify-email?token={token}"

        subject = "Verifique seu email - RastreAgro"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #2E7D32; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; background-color: #f9f9f9; }}
                .button {{ display: inline-block; padding: 12px 24px; background-color: #2E7D32; 
                          color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>RastreAgro</h1>
                </div>
                <div class="content">
                    <h2>Verificação de Email</h2>
                    <p>Olá{f', {user_name}' if user_name else ''}!</p>
                    <p>Obrigado por se cadastrar no RastreAgro. Para ativar sua conta, 
                    clique no botão abaixo para verificar seu endereço de email:</p>
                    <p style="text-align: center;">
                        <a href="{verification_url}" class="button">Verificar Email</a>
                    </p>
                    <p>Ou copie e cole o link abaixo no seu navegador:</p>
                    <p style="word-break: break-all; color: #2E7D32;">{verification_url}</p>
                    <p><strong>Este link expira em 48 horas.</strong></p>
                    <p>Se você não criou esta conta, ignore este email.</p>
                </div>
                <div class="footer">
                    <p>© 2024 RastreAgro. Todos os direitos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        """

        try:
            import asyncio
            
            params = {
                "from": self.from_email,
                "to": [email],
                "subject": subject,
                "html": html_content,
            }
            
            # Resend SDK é síncrono, então executamos em thread pool
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, self.emails.send, params)
            return True
            
        except Exception as e:
            # Log do erro (em produção, usar logging adequado)
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Erro ao enviar email de verificação: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao enviar email de verificação: {str(e)}"
            )

    async def send_password_reset_email(
        self, email: str, token: str, user_name: str = ""
    ) -> bool:
        """
        Envia email de recuperação de senha usando Resend
        
        Args:
            email: Email do destinatário
            token: Token de recuperação de senha
            user_name: Nome do usuário (opcional)
            
        Returns:
            bool: True se enviado com sucesso, False caso contrário
            
        Raises:
            HTTPException: Se Resend não estiver configurado ou houver erro
        """
        if not self.emails:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Serviço de email não configurado. Configure RESEND_API_KEY no .env"
            )

        reset_url = self.get_password_reset_url(token)

        subject = "Recuperação de Senha - RastreAgro"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #2E7D32; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; background-color: #f9f9f9; }}
                .button {{ display: inline-block; padding: 12px 24px; background-color: #2E7D32; 
                          color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
                .warning {{ background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>RastreAgro</h1>
                </div>
                <div class="content">
                    <h2>Recuperação de Senha</h2>
                    <p>Olá{f', {user_name}' if user_name else ''}!</p>
                    <p>Recebemos uma solicitação para redefinir a senha da sua conta no RastreAgro.</p>
                    <p>Clique no botão abaixo para criar uma nova senha:</p>
                    <p style="text-align: center;">
                        <a href="{reset_url}" class="button">Redefinir Senha</a>
                    </p>
                    <p>Ou copie e cole o link abaixo no seu navegador:</p>
                    <p style="word-break: break-all; color: #2E7D32;">{reset_url}</p>
                    <div class="warning">
                        <p><strong>⚠️ Importante:</strong></p>
                        <ul>
                            <li>Este link expira em <strong>1 hora</strong></li>
                            <li>Se você não solicitou esta recuperação, ignore este email</li>
                            <li>Sua senha atual permanecerá inalterada se você não clicar no link</li>
                        </ul>
                    </div>
                </div>
                <div class="footer">
                    <p>© 2024 RastreAgro. Todos os direitos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        """

        try:
            import asyncio
            
            params = {
                "from": self.from_email,
                "to": [email],
                "subject": subject,
                "html": html_content,
            }
            
            # Resend SDK é síncrono, então executamos em thread pool
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, self.emails.send, params)
            return True
            
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Erro ao enviar email de recuperação de senha: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao enviar email de recuperação de senha: {str(e)}"
            )

