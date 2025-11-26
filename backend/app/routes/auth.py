"""Rotas responsáveis pela autenticação de usuários"""

from fastapi import APIRouter, Depends, Query
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.schemas import LoginRequest, RefreshRequest, RegisterRequest, TokenPair
from app.schemas.auth import (
    CheckAvailabilityRequest,
    CheckAvailabilityResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/check-availability",
    response_model=CheckAvailabilityResponse,
    summary="Verificar disponibilidade de email/CPF/CNPJ",
)
def check_availability(payload: CheckAvailabilityRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.check_availability(payload)


@router.post("/register", response_model=dict, summary="Registrar usuário")
async def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    Registra um novo usuário e envia email de verificação.
    O usuário precisa verificar o email antes de fazer login.
    """
    service = AuthService(db)
    user = await service.register(payload)

    # Não faz login automático - usuário precisa verificar email primeiro
    return {
        "message": "Cadastro realizado com sucesso! Verifique seu email para ativar sua conta.",
        "email": user.email,
        "email_verificado": user.email_verificado,
    }


@router.post("/login", response_model=TokenPair, summary="Login com email e senha")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    service = AuthService(db)
    payload = LoginRequest(email=form_data.username, password=form_data.password)
    access_token, refresh_token, _ = service.authenticate(payload)
    return TokenPair(access_token=access_token, refresh_token=refresh_token)


@router.post(
    "/refresh", response_model=TokenPair, summary="Gerar novo access token a partir do refresh"
)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    access_token = service.refresh(payload.refresh_token)
    return TokenPair(access_token=access_token, refresh_token=payload.refresh_token)


@router.post("/verify-email", summary="Verificar email com token")
async def verify_email(token: str, db: Session = Depends(get_db)):
    """Verifica email do usuário usando token de verificação"""
    from datetime import datetime

    from fastapi import HTTPException, status

    service = AuthService(db)
    verification_token = service.email_verification_repo.get_by_token(token)

    if not verification_token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token de verificação inválido ou expirado",
        )

    if verification_token.expires_at < datetime.utcnow():
        service.email_verification_repo.delete(verification_token)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de verificação expirado. Solicite um novo token.",
        )

    # Marca email como verificado
    user = service.user_repo.get_by_id(verification_token.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")

    user.email_verificado = True
    db.commit()
    db.refresh(user)

    # Remove token usado
    service.email_verification_repo.delete(verification_token)

    return {"message": "Email verificado com sucesso! Você já pode fazer login."}


@router.get("/dev/get-verification-token", summary="[DEV] Obter token de verificação por email")
def get_verification_token_dev(
    email: str = Query(..., description="Email do usuário"), db: Session = Depends(get_db)
):
    """
    [APENAS DESENVOLVIMENTO] Retorna o token de verificação de um usuário.
    Use apenas quando Resend não estiver configurado.
    """
    from fastapi import HTTPException, status

    service = AuthService(db)
    user = service.user_repo.get_by_email(email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado"
        )

    verification_token = service.email_verification_repo.get_by_user_id(user.id)

    if not verification_token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token de verificação não encontrado. O usuário pode não ter sido cadastrado ainda.",
        )

    verification_url = service.email_service.get_verification_url(verification_token.token)

    return {
        "email": user.email,
        "token": verification_token.token,
        "verification_url": verification_url,
        "expires_at": verification_token.expires_at.isoformat(),
        "email_verificado": user.email_verificado,
        "warning": "Este endpoint é apenas para desenvolvimento. Configure RESEND_API_KEY para produção.",
    }


@router.post("/resend-verification", summary="Reenviar email de verificação")
async def resend_verification_email(
    email: str = Query(..., description="Email do usuário"), db: Session = Depends(get_db)
):
    """
    Reenvia email de verificação para o usuário.
    Por segurança, sempre retorna mensagem de sucesso mesmo se o email não existir.
    """
    import logging

    logger = logging.getLogger(__name__)
    service = AuthService(db)
    user = service.user_repo.get_by_email(email)

    if not user:
        # Por segurança, não revela se o email existe ou não
        return {
            "message": "Se o email estiver cadastrado, um novo link de verificação será enviado"
        }

    if user.email_verificado:
        return {
            "message": "Email já verificado. Você já pode fazer login.",
            "email_verificado": True,
        }

    # Cria novo token e envia email
    try:
        await service._create_and_send_verification_email(user)
        return {
            "message": "Email de verificação reenviado com sucesso. Verifique sua caixa de entrada.",
            "email_verificado": False,
        }
    except Exception as exc:
        # Log do erro mas não revela ao usuário
        logger.error(f"Erro ao reenviar email de verificação: {exc}")
        return {
            "message": "Se o email estiver cadastrado, um novo link de verificação será enviado"
        }


@router.post("/forgot-password", summary="Solicitar recuperação de senha")
async def forgot_password(
    payload: ForgotPasswordRequest, db: Session = Depends(get_db)
):
    """
    Solicita recuperação de senha.
    Envia email com link para redefinir senha.
    Por segurança, sempre retorna mensagem de sucesso mesmo se o email não existir.
    """
    service = AuthService(db)
    await service.request_password_reset(payload.email)
    
    # Por segurança, sempre retorna sucesso
    return {
        "message": "Se o email estiver cadastrado, um link de recuperação de senha será enviado."
    }


@router.post("/reset-password", summary="Redefinir senha com token")
async def reset_password(
    payload: ResetPasswordRequest, db: Session = Depends(get_db)
):
    """
    Redefine a senha do usuário usando token de recuperação.
    Token deve ser válido, não expirado e não ter sido usado anteriormente.
    """
    service = AuthService(db)
    await service.reset_password(payload.token, payload.new_password)
    
    return {
        "message": "Senha redefinida com sucesso! Você já pode fazer login com a nova senha."
    }
