"""Rotas responsáveis pela autenticação de usuários"""

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.schemas import RegisterRequest, LoginRequest, TokenPair, RefreshRequest
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenPair, summary="Registrar usuário")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    user = service.register(payload)
    access_token, refresh_token, _ = service.authenticate(LoginRequest(email=user.email, password=payload.password))
    return TokenPair(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenPair, summary="Login com email e senha")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    service = AuthService(db)
    payload = LoginRequest(email=form_data.username, password=form_data.password)
    access_token, refresh_token, _ = service.authenticate(payload)
    return TokenPair(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenPair, summary="Gerar novo access token a partir do refresh")
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    access_token = service.refresh(payload.refresh_token)
    return TokenPair(access_token=access_token, refresh_token=payload.refresh_token)

