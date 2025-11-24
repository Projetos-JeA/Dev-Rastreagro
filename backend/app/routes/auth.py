"""Rotas responsáveis pela autenticação de usuários"""

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.schemas import RegisterRequest, LoginRequest, TokenPair, RefreshRequest
from app.schemas.auth import CheckAvailabilityRequest, CheckAvailabilityResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/check-availability",
    response_model=CheckAvailabilityResponse,
    summary="Verificar disponibilidade de email/CPF/CNPJ"
)
def check_availability(payload: CheckAvailabilityRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.check_availability(payload)


@router.post("/register", response_model=TokenPair, summary="Registrar usuário")
async def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    user = await service.register(payload)
    access_token, refresh_token, _ = service.authenticate(
        LoginRequest(email=user.email, password=payload.password)
    )
    return TokenPair(access_token=access_token, refresh_token=refresh_token)


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
            detail="Token de verificação inválido ou expirado"
        )
    
    if verification_token.expires_at < datetime.utcnow():
        service.email_verification_repo.delete(verification_token)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de verificação expirado. Solicite um novo token."
        )
    
    # Marca email como verificado
    user = service.user_repo.get_by_id(verification_token.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    user.email_verificado = True
    db.commit()
    db.refresh(user)
    
    # Remove token usado
    service.email_verification_repo.delete(verification_token)
    
    return {"message": "Email verificado com sucesso"}


@router.post("/resend-verification", summary="Reenviar email de verificação")
async def resend_verification_email(email: str, db: Session = Depends(get_db)):
    """Reenvia email de verificação para o usuário"""
    from fastapi import HTTPException, status
    
    service = AuthService(db)
    user = service.user_repo.get_by_email(email)
    
    if not user:
        # Por segurança, não revela se o email existe ou não
        return {"message": "Se o email estiver cadastrado, um novo link de verificação será enviado"}
    
    if user.email_verificado:
        return {"message": "Email já verificado"}
    
    # Cria novo token e envia email
    await service._create_and_send_verification_email(user)
    
    return {"message": "Email de verificação reenviado com sucesso"}
